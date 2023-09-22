

import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  try {
    const body = await req.json();
    const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
      headers: {
        authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
      },
    });


    const {
      productId,
      imageUrls,
      orderItemsIds,
      reviewsIds,
      ordersIds,
    } = body;

    const disconnectOrderQueries = orderItemsIds.map(
      (orderItem) => `
        id_in: "${orderItem}",
      `
    ); 
    //TODO: Instead of deleting Order related to deleted orderItems, related to the deleted product,
    // set Order.isRemoved to true??
    
    const mutationQueries = [
      `deleteManyTags(where: { product: { id: $productId } }) { count }`,
      `deleteManyProductVariants(where: { product: { id: $productId } }) { count }`,
      `deleteManyImageUrls(where: { url_in: $imageUrls }) { count }`,
      `deleteManyOrders( where: { orderItems_every: {OR: {id_in: $orderItemsIds2}} } ) {
        count
      }`,
      `updateProduct(
        where: { id: $productId },
        data: {
          orderItems: { delete: $orderItemsIds },
          reviews: { delete: $reviewsIds }
        }
      ) { id }`,
      `deleteProduct(where: { id: $productId }) { id }`,
    ];
    
    const mutation = `
      mutation DeleteProductAndRelatedEntities(
        $productId: ID!,
        $imageUrls: [String!]!,
        $orderItemsIds: [OrderItemWhereUniqueInput!]!,
        $orderItemsIds2: [ID],
        $reviewsIds: [ReviewWhereUniqueInput!]
      ) {
        ${mutationQueries.join("\n")}
      }
    `;

    const deletedEntities = await client.request(mutation, {
      productId,
      imageUrls,
      orderItemsIds,
      orderItemsIds2: orderItemsIds.map((id) => (id.id)),
      reviewsIds,
      ordersIds,
    });

    return new Response(JSON.stringify(deletedEntities.deleteProduct));
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response(JSON.stringify({ status: 500, body: error.message }));
  }
}
