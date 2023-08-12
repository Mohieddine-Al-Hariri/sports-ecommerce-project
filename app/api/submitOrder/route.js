import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  // console.log("_________________________body: \n", body);
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  const { itemsIds, userId, totalPrice } = body;
  try {
    const submittedOrder = await client.request(
      `
        mutation SubmitOrder($itemsIds: [OrderItemWhereUniqueInput!]!, $userId: ID!, $totalPrice: Float!) {
          createOrder(
            data: {
              total: $totalPrice
              orderItems: { connect: $itemsIds }
              theUser: { connect: { id: $userId } }
            }
          ) {
            createdAt
            id
            orderItems {
              product {
                name
              }
            }
          }
        }
      `,
      { itemsIds: itemsIds.map((id) => ({ id })), userId, totalPrice }
    );
    
    return new Response(JSON.stringify(submittedOrder)); // Should return the id
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }

}
