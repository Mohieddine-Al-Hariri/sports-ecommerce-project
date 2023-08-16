import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json(); 
  console.log("________________________body: \n", body);

  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  try {
    const { cartId, itemsIds } = body;
    const updatedCartId = await client.request(
      `
        mutation updateCart(
          $itemsIds: [OrderItemWhereUniqueInput!]!,
          $cartId: ID!
        ) 
        {
          updateCart(data: {orderItems: {disconnect: $itemsIds}}, where: {id: $cartId}){
            id
          }
        }
      `,
      { itemsIds: itemsIds.map((id) => ({ id })), cartId }
    );
    return new Response(JSON.stringify(cartId));
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
