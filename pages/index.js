import Link from 'next/link'
import axios from 'axios'
import _ from 'lodash'
import Footer from './partials/footer'
import Header from './partials/header'
import helpers from '../helpers'
import config from '../config'
   
// Just comment added

export async function getStaticProps({ req }) {

  const query = `{
    getObjects(
      bucket_slug: "${config.bucket.slug}",
      input: {
        read_key: "${config.bucket.read_key}"
      })
    {
      _id
      type_slug
      slug
      title
      metadata
      created_at
    }
  }`

  const allPosts = await axios.post(`https://graphql.cosmicjs.com/v1`, { query })
    .then(function (response) {
      return {
        cosmic: {
          posts: _.filter(response.data.data.getObjects, { type_slug: 'posts' }),
          global: _.keyBy(_.filter(response.data.data.getObjects, { type_slug: 'globals' }), 'slug')
        }
      }
    })
    .catch(function (error) {
      console.log(error)
    })

  return {
    props: { allPosts }
  }

}

const Index = ({ allPosts }) => {

    if (!allPosts.cosmic)
        return <div>Loading...</div>

    return (
        <div>

          <Header />

          <main className="container">
            {
              !allPosts.cosmic.posts &&
              'You must add at least one Post to your Bucket'
            }
            {
              allPosts.cosmic.posts &&
              allPosts.cosmic.posts.map(post => {
                const friendly_date = helpers.friendlyDate(new Date(post.created_at))
                post.friendly_date = friendly_date.month + ' ' + friendly_date.date
                const slug = post.slug
                return (
                   <div className="card" data-href={`/${post.slug}`} key={post._id}>
                    {
                      post.metadata.hero.imgix_url &&
                      <Link as={`/posts/${slug}`} href="posts/[slug]">
                        <a className="blog-post-hero blog-post-hero--short" style={{ backgroundImage: `url(${post.metadata.hero.imgix_url})`}} aria-label="Image of the old news article"></a>
                      </Link>
                    }
                    <div className="card-padding">
                      <h2 className="blog__title blog__title--small">
                        <Link as={`/posts/${slug}`} href="posts/[slug]">
                          <a aria-label="Title of the old news article">{post.title}</a>
                        </Link>
                      </h2>
                      <div className="blog__author">
                        <a href={`/author/${post.metadata.author.slug}`}>
                          <div className="blog__author-image" style={{ backgroundImage: `url(${post.metadata.author.metafields[0].imgix_url}?w=100)`}}></div>
                        </a>
                        <div className="blog__author-title">by <a href={`/author/${post.metadata.author.slug}`}>{post.metadata.author.title}</a> on {post.friendly_date}</div>
                        <div className="clearfix"></div>
                      </div>

                      <Link as={`/posts/${slug}`} href="posts/[slug]">

                          <div className="blog__teaser droid" dangerouslySetInnerHTML={{__html: post.metadata.teaser}}></div>

                      </Link>

                      <div className="blog__read-more">
                        <Link as={`/posts/${slug}`} href="posts/[slug]">
                          <a aria-label="Read more about old news article">Read more...</a>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </main>

          <Footer />

        </div>
      )
}

export default Index;
