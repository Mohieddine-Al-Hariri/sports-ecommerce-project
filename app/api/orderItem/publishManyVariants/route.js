import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const itemsVariantsIds = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  try {
    const publishedVariants = await client.request(
      `
        mutation PublishManyOrderItemVariants($itemsVariantsIds: [ID]) {
          publishManyOrderItemVariants(where: {id_in: $itemsVariantsIds}) {
            count
          }
        }
      `,
      // eg: { itemsVariantsIds: ['clldvjfspkab60buo4vanqkm1', 'clldvjfsrkab80buodl6ov0zf'] }
      { itemsVariantsIds: itemsVariantsIds.map((id) => (id.id)) }
    );
    return new Response(JSON.stringify(publishedVariants));
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }
}
