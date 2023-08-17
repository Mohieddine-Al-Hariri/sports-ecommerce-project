import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  const { itemId, userSlug, quantity, totalPrice, cartId, chosenProductVariant } = body;
  try {
    const isItemAdded = await client.request(
      `
        mutation UpdateCart($itemId: ID!, $userSlug: String!, $quantity: Int!, $totalPrice: Float!, $cartId: ID!, $chosenProductVariant: String!) {
          updateCart(
            where: {id: $cartId}
            data: {orderItems: {create: {quantity: $quantity, total: $totalPrice, variant: $chosenProductVariant, product: {connect: {id: $itemId}}, theUser: {connect: {slug: $userSlug}}}}}
          ) {
            id
            orderItems {
              id
            }
          }
        }
      `,
      { itemId, userSlug, quantity, totalPrice, cartId, chosenProductVariant }
    );

    return new Response(JSON.stringify(isItemAdded)); // Should return the id
    // res.status(201).json(newComment.createComment);
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }

  // res.status(405).json({ message: 'Method not allowed.' });
}
