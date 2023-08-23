import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const itemId = await req.json(); 
  console.log("itemId: ", itemId);

  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  try {
    const removedItemId = await client.request(
      `
        mutation DeleteOrderItem(
          $itemId: ID!
        ) 
        {
          deleteOrderItem(where: {id: $itemId}){
            id
          }
        }
      `,
      { itemId }
    );
    return new Response(JSON.stringify(removedItemId));
    // res.status(201).json(newComment.createComment);
  } catch (error) {
    // res.status(500).json({ message: 'Something went wrong.' });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  // res.status(405).json({ message: 'Method not allowed.' });
}
