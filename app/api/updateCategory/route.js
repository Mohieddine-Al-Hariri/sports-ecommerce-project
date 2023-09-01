import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  const { name, show, description, categoryId } = body;
  try {
    const updateCategory = await client.request(
      `
        mutation updateCategory($name: String!, $categoryId: ID!, $description: String!, $show: Boolean!) {
          updateCategory(data: {name: $name, show: $show, description: $description}, where: {id: $categoryId}) {
            id
          }
        }
      `,
      { name, show, description, categoryId }
    );
    return new Response(JSON.stringify(updateCategory)); // Should return the id
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }

}
