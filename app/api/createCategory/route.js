import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  const { name, slug, description, products } = body;
  try {
    const createdProduct = await client.request(
      `
        mutation CreateProduct($name: String!, $slug: String!, $description: String!, $products: [ProductWhereUniqueInput!]!) {
          createCategory(data: {name: $name, slug: $slug, show: true, description: $description, products: {connect: $products}}) {
            id
          }
        }
      `,
      { name, slug, description, products }
    );
    return new Response(JSON.stringify(createdProduct)); // Should return the id
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }

}
