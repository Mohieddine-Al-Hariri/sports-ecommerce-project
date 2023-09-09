import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const orderItemId = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  try {
    const publishedItems = await client.request(
      `
        mutation PublishManyOrderItems($orderItemId: [ID]) {
          publishManyOrderItems(where: {orderItem: {id: ""}}) {
            count
          }
        }
      `,
      { orderItemId }
    );
    return new Response(JSON.stringify(publishedItems));
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }
}
