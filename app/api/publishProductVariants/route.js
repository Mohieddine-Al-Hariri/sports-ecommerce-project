import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const productVariantsIds = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  try {
    const publishedProductVariants = await client.request(
      `
        mutation PublishManyProductVariants($productVariantsIds: [ID]) {
          publishManyProductVariants(where: { id_in: $productVariantsIds }) {
            count
          }
        }
      `,
      // eg: { productVariantsIds: ['clldvjfspkab60buo4vanqkm1', 'clldvjfsrkab80buodl6ov0zf'] }
      { productVariantsIds: productVariantsIds.map((id) => (id.id)) }
    );
    return new Response(JSON.stringify(publishedProductVariants)); // Should return the post's title
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }
}
