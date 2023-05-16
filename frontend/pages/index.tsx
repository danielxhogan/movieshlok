export type Post = {
  slug: String;
  title: String;
  content: String;
  postId: React.Key;
}

type Posts = {
  nodes: Post[]
}

type Props = {
  posts: Posts;
}

export default function HomePage({ posts }: Props) {
  console.log(posts);
  return <>
     { posts.nodes.map(post => {
       return (
         <ul key={post.postId}>{post.title}</ul>
       )
     })}
    <h1>Wa Suh Dude!!!</h1>
  </>
}

export async function getStaticProps() {
  const res = await fetch("http://localhost/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query NewQuery {
          posts {
            nodes {
              slug
              title
              postId
            }
          }
        }
      `,
    })
  })
  const response = await res.json();

  return {
    props: {
      posts: response.data.posts,
    },
  }
}