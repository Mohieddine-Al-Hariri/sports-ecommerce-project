import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  //TODO: FINISH
  const body = await req.json();
  console.log("_____body: _____\n\n", body);
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  const { itemId, userSlug, quantity, totalPrice, cartId, chosenProductsVariants, isCollection } = body;
  const variantsInput = {
    create: chosenProductsVariants.map((variant) => ({
      name: variant,
    }))
  }
  try {
    const isItemAdded = await client.request(
      `
        mutation UpdateCart($itemId: ID!, $userSlug: String!, $quantity: Int!, $totalPrice: Float!, $cartId: ID!, $variants: OrderItemVariantCreateManyInlineInput) {
          updateCart(
            where: {id: $cartId}
            data: {orderItems: {create: {quantity: $quantity, total: $totalPrice, orderItemVariants: $variants, ${isCollection? "collection" : "product"}: {connect: {id: $itemId}}, theUser: {connect: {slug: $userSlug}}}}}
          ) {
            id
            orderItems {
              id
            }
          }
        }
      `,
      { itemId, userSlug, quantity, totalPrice, cartId, variants: variantsInput }
    );
    console.log("____isItemAdded: ____\n\n", isItemAdded);
    return new Response(JSON.stringify(isItemAdded)); 
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }

}
