import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const orderItemsIds = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  try {
    const publishedItems = await client.request(
      `
        mutation PublishManyOrderItems($orderItemsIds: [ID]) {
          publishManyOrderItems(where: {id_in: $orderItemsIds}) {
            count
          }
        }
      `,
      // eg: { orderItemsIds: ['clldvjfspkab60buo4vanqkm1', 'clldvjfsrkab80buodl6ov0zf'] }
      { orderItemsIds: orderItemsIds.map((id) => (id.id)) }
    );
    return new Response(JSON.stringify(publishedItems));
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }
}
