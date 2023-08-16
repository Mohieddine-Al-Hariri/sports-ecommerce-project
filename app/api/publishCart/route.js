import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const cartId = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  try {
    const publishedCart = await client.request(
      `
        mutation PublishCart($cartId: ID!) {
          publishCart(where: {id: $cartId}) {
            id
          }
        }
      `,
      { cartId }
    );
    
    return new Response(JSON.stringify(publishedCart)); // Should return the post's title
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }
}
