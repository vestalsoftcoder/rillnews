import axios from 'axios'
import _ from 'lodash'
import Footer from '../partials/footer'
import Header from '../partials/header'
import helpers from '../../helpers'
import config from '../../config'

import Cosmic from 'cosmicjs'

const BUCKET_SLUG = process.env.COSMIC_BUCKET_SLUG
const READ_KEY = process.env.COSMIC_READ_KEY

const bucket = Cosmic().bucket({
  slug: BUCKET_SLUG,
  read_key: READ_KEY
})

export async function getAllPostsWithSlug() {
  const params = {
    type: 'posts',
    props: 'slug',
  }
  const data = await bucket.getObjects(params)
  return data.objects
}


export async function getStaticPaths() {
  const allPosts = (await getAllPostsWithSlug()) || []
  return {
    paths: allPosts.map((post) => `/posts/${post.slug}`),
    fallback: true
  }
}

export async function getStaticProps({ params }) {

  const globals_query = `{
    getObjects(
      bucket_slug: "${config.bucket.slug}",
      input: {read_key: "${config.bucket.read_key}"}
    ) {
      type_slug
      slug
      title
      content
      metadata
      created_at
    }
  }`

  const globals = await axios.post(`https://graphql.cosmicjs.com/v1`, { query: globals_query })
  .then(function (response) {
    return _.keyBy(_.filter(response.data.data.getObjects, { type_slug: 'globals' }), 'slug')
  })
  .catch(function (error) {
    console.log(error)
  })

  const post_query = `{
    getObject(bucket_slug: "${config.bucket.slug}", input: {
      read_key: "${config.bucket.read_key}",
      slug: "${params.slug}",
      revision: ""
    }) {
      type_slug
      slug
      title
      content
      metadata
      created_at
    }
  }`
  const post = await axios.post(`https://graphql.cosmicjs.com/v1`, { query: post_query })
  .then(function (response) {
    return response.data.data.getObject
  })
  .catch(function (error) {
    console.log(error)
  })
  return await Promise.all([globals, post]).then(values => {
    return {
      props: {
        global: values[0],
        post: values[1]
      }
    }
  });
}

export default function Post({global, post}) {

    if (!post)
      return <div>Loading...</div>

    let friendly_date

    if (post) {
      friendly_date = helpers.friendlyDate(new Date(post.created_at))
      post.friendly_date = friendly_date.month + ' ' + friendly_date.date
    }

    return (
      <div>
        <Header />
        {
          post && post.metadata.hero.imgix_url &&
          <div className="blog-post-hero" style={{ backgroundImage: `url(${post.metadata.hero.imgix_url})`}}></div>
        }
        <main className="container">
          <div className="card-padding">
            <h2 className="blog__title">
              {
                !post &&
                <div style={{ textAlign: 'center' }}>Post Not found</div>
              }
              {
                post &&
                <a href={`/${post.slug}`}>{post.title}</a>
              }
            </h2>
            {
              post &&
              <div>
                <div className="blog__author">
                  <a href={`/author/${post.metadata.author.slug}`}>
                    <div className="blog__author-image" style={{ backgroundImage: `url(${post.metadata.author.metafields[0].imgix_url}?w=100)`}}></div>
                  </a>
                  <div className="blog__author-title">by <a href={`/author/${post.metadata.author.slug}`}>{post.metadata.author.title}</a> on {post.friendly_date}</div>
                  <div className="clearfix"></div>
                </div>
                <div className="blog__teaser droid" dangerouslySetInnerHTML={{__html: post.content}}></div>
              </div>
            }
          </div>
        </main>
        <Footer />
      </div>
    )

}
