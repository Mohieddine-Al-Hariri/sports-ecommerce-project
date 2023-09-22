import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  const { userId, collectionId, headline, rating, content } = body;
  
  try {
    const reviewCollection = await client.request(
      `
        mutation ReviewCollection($collectionId: ID!, $userId: ID!, $headline: String!, $rating: Float!, $content: String!) {
          updateCollection(
            where: {id: $collectionId}
            data: {reviews: {create: {headline: $headline, content: $content, rating: $rating, theUser: {connect: {id: $userId}} }}}
          )
          {
            id
            reviews {
              id
            }
          }
        }
      `,
      { userId, collectionId, headline, rating, content }
    );

    return new Response(JSON.stringify(reviewCollection)); // Should return the id
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({ status: 500, body: error.message });
  }
}
