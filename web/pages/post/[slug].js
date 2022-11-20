import groq from 'groq'
import imageUrlBuilder from '@sanity/image-url'
import {PortableText} from '@portabletext/react'
import client from '../../client'
import Link from 'next/link'
import {getGlobalNav} from '../../lib/GlobalNav';
import React from 'react'


function urlFor (source) {
  return imageUrlBuilder(client).image(source)
}

const ptComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null
      }
      return (
        <img
          alt={value.alt || ' '}
          loading="lazy"
          src={urlFor(value).width(320).height(240).fit('max').auto('format')}
        />
      )
    }
  }
}

const Post = ({post, globalNavContent, navData}) => {
  if(!post){
    return(<>No data fetched</>)
  }
  const {
    title = 'Missing title',
    name = 'Missing name',
    categories,
    authorImage,
    body = [],
    link,
    linkLabel
  } = post
  return (
    <article>
      <div dangerouslySetInnerHTML={{__html: globalNavContent}}></div>
      <h1>{title}</h1>
      <span>By {name}</span>
      {categories && (
        <ul>
          Posted in
          {categories.map(category => <li key={category}>{category}</li>)}
        </ul>
      )}
      {authorImage && (
        <div>
          <img
            src={urlFor(authorImage)
              .width(50)
              .url()}
            alt={`${name}'s picture`}
          />
        </div>
      )}
      <PortableText
        value={body}
        components={ptComponents}
      />
      {linkLabel && 
      <React.Fragment>
      Next link: <Link href={link}>{linkLabel}</Link> <br/>
      Normal link: <a href={link}>{linkLabel}</a>
      </React.Fragment>}
      <br/>
      {navData && <React.Fragment>
        {navData?.data?.map((item, idx) => (
          <div key={idx}>
            {item.name}
          </div>
        ))}
      </React.Fragment>}
    </article>
  )
}

const query = groq`*[_type == "post" && slug.current == $slug][0]{
  title,
  "name": author->name,
  "categories": categories[]->title,
  "authorImage": author->image,
  body,
  link,
  linkLabel
}`
export async function getStaticPaths() {
  
  const paths = await client.fetch(
    groq`*[_type == "post" && defined(slug.current)][].slug.current`
  )
  const staticPaths = {
    paths: paths.map((slug) => ({params: {slug}})),
    fallback: 'blocking',
  };
  return staticPaths;
}

export async function getStaticProps(context) {

  const { slug = "welcome" } = context.params
  const post = await client.fetch(query, { slug });
  const navDataReq = await fetch('https://private-6c98d7-myupc.apiary-mock.com/get/nav-data');
  const navData = await navDataReq?.json();
  let globalNavContent = await getGlobalNav();
  return {
    props: {
      post,
      globalNavContent,
      navData
    },
    revalidate: 60 //re-validate sanity content every one minute
  }
}
export default Post