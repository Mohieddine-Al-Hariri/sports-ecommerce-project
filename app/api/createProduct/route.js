import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  // console.log("_________________________body: \n", body);
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  const { name, slug, description, price, state, imgUrls, excerpt } = body;
  try {//TODO: add variants
    const createdProduct = await client.request(
      `
        mutation CreateProduct($name: String!, $slug: String!, $description: String!, $price: Float!, $state: ProductStates!, $imageUrls: [ImageUrlCreateInput!], $excerpt: String!) {
          createProduct(
            data: { name: $name, slug: $slug, description: $description, price: $price, state: $state, imageUrls: { create: $imageUrls }, excerpt: $excerpt }
          ) {
            id
            imageUrls {
              id
            }
          }
        }
      `,
      { imageUrls: imgUrls.map((url) => ({ url })), name, slug, description, price, state, excerpt }
    );
    return new Response(JSON.stringify(createdProduct)); // Should return the id
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }

}
