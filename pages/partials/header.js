import Head from 'next/head'

export default function Header() {
  return (
    <Head key={1}>
      <title>Rillnews: Historical Old News</title>
      <link rel="stylesheet" type="text/css" href="/static/style.css"/>
      <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css?family=Droid+Serif" rel="stylesheet"/>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <meta name="description" content="A historical old news of the passed and current times" />
    </Head>
    // ,
    // <header className="header" key={2}>
    //   <h1 className="site-title">
    //   </h1>
    // </header>
  )
}
