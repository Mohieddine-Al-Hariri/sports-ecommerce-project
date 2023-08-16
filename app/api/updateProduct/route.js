import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  const { productId, name, imageUrls, previousImageUrls, excerpt, description, price, state } = body;

  try {//TODO: add collection and category for later...
    const updatedProduct = await client.request( 
      `
        mutation updateProduct($productId: ID!, $name: String!, $imageUrls: [String!]!, $previousImageUrls: [ID!]!, $excerpt: String!, $description: !Markdown, $price: Float!, $state: ProductStates!) {
          updateProduct(
            where: {id: $productId}
            data: {name: $name, imageUrls: {create: {url: $imageUrls}, delete: {id: $previousImageUrls}}, excerpt: $excerpt, description: $description, price: $price, state: $state}
          ) {
            id
          }
        }
      `,
      { productId, name, imageUrls, previousImageUrls, excerpt, description, price, state }
    );
    
    return new Response(JSON.stringify(updatedProduct)); // Should return the post's title
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }
}
