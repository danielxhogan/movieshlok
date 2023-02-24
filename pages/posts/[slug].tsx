import { Post } from "../index";
import { GetStaticProps, GetStaticPaths } from 'next'

type Props = {
  post: Post;
}

export default function PostPage({ post }: Props ) {
  console.log(`data: ${post.title}`);

  return <>
    <h1>{post.title}</h1>
    <article dangerouslySetInnerHTML={{__html: post.content.toString()}}></article>
  </>
}

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch("http://localhost/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query AllPostsQuery {
          posts {
            nodes {
              slug
              content
              title
              featuredImage {
                node {
                  sourceUrl
                }
              }
            }
          }
        }
      `
    })
  });
  const response = await res.json();
  const posts = response.data.posts.nodes;

  const paths = posts.map((post: Post) => {
    return { params: { slug: post.slug }}
  })

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async (context) => {
  if (context.params) {
    const res = await fetch("http://localhost/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($id: ID!, $idType: PostIdType!) {
            post(id: $id, idType: $idType) {
              title
              slug
              content
              featuredImage {
                node {
                  sourceUrl
                }
              }
            }
          }
        `,
        variables: {
          id: context.params.slug,
          idType: "SLUG"
        }
      })
    });
    const response = await res.json();

    return {
      props: {
        post: response.data.post
      }
    }
  } else {
    return {
      props: {
        success: false
      }
    }
  }
}