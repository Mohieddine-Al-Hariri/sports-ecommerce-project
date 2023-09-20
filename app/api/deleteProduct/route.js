

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
    console.log("orderItemsIds: \n", orderItemsIds);

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

/*
import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  try {
    const body = await req.json();
    const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT, {
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
      (orderItem) => `{
        updateOrderItem(
          data: { order: { disconnect: true } },
          where: { id: "${orderItem.id}" }
        ) {
          id
        }
      }`
    );

    const mutationQueries = [
      `deleteManyTags(where: { product: { id: "${productId}" } }) { count }`,
      `deleteManyProductVariants(where: { product: { id: "${productId}" } }) { count }`,
      `deleteManyImageUrls(where: { url_in: ${JSON.stringify(imageUrls)} }) { count }`,
      ...disconnectOrderQueries,
      `updateProduct(
        where: { id: "${productId}" },
        data: {
          orderItems: { delete: ${JSON.stringify(orderItemsIds)} },
          reviews: { delete: ${JSON.stringify(reviewsIds)} }
        }
      ) { id }`,
      `deleteProduct(where: { id: "${productId}" }) { id }`,
    ];

    const mutation = `
      mutation DeleteProductAndRelatedEntities(
        $productId: ID!
      ) {
        ${mutationQueries.join("\n")}
      }
    `;

    const deletedEntities = await client.request(mutation, {
      productId,
      imageUrls,
      orderItemsIds,
      reviewsIds,
      ordersIds,
    });

    return new Response(JSON.stringify(deletedEntities.deleteProduct));
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response(JSON.stringify({ status: 500, body: error.message }));
  }
}

*/

// import { GraphQLClient } from "graphql-request";

// export async function POST(req) {
//   const body = await req.json();
//   const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
//     headers: {
//       authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
//     },
//   });

//   const { productId, imageUrls, orderItemsIds, reviewsIds, ordersIds } = body;
//   console.log("orderItemsIds: ", orderItemsIds);
//   const disconnectOrderQueries = orderItemsIds.map(orderItem => `updateOrderItem(data: {order: {disconnect: true}}, where: {id: "${orderItem.id}"} ){id}`).join("\n");
//   console.log("disconnectOrderQueries: ", disconnectOrderQueries);
//   //TODO: Optimize
//   try {
//     // Combine deletion of related entities into a single GraphQL request
//     const deletedEntities = await client.request(
//       `
//         mutation DeleteProductAndRelatedEntities($productId: ID!, $imageUrls: [String], $orderItemsIds: [OrderItemWhereUniqueInput!]!, $reviewsIds: [ReviewWhereUniqueInput!]) {
//           deleteManyTags(where: { product: { id: $productId } }) {
//             count
//           }
//           deleteManyProductVariants(where: { product: { id: $productId } }) {
//             count
//           }
//           deleteManyImageUrls(where: {url_in: $imageUrls} ) {
//             count
//           }
//           ${disconnectOrderQueries}
//           updateProduct(where: {id: $productId}, data: { orderItems: {delete: $orderItemsIds}, reviews: {delete: $reviewsIds} }) {
//             id
//           }
//           deleteProduct(where: { id: $productId }) {
//             id
//           }
//         }
//       `,
//       { productId, imageUrls: imageUrls, orderItemsIds, reviewsIds, ordersIds }
//     );

//     return new Response(JSON.stringify(deletedEntities.deleteProduct));
//   } catch (error) {
//     console.error("Error in POST:", error);
//     return new Response(JSON.stringify({ status: 500, body: error.message }));
//   }
// }

// import { GraphQLClient } from "graphql-request";

// export async function POST(req) {
//   const productId = await req.json();
//   const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT, {
//     headers: {
//       authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
//     },
//   });

//   try {
//     // First, delete the tags associated with the product
//     await client.request(
//       `
//         mutation DeleteTags($productId: ID!) {
//           deleteManyTags(where: { products: { some: { id: $productId } } }) {
//             count
//           }
//         }
//       `,
//       { productId }
//     );

//     // Then, delete the product variants associated with the product
//     await client.request(
//       `
//         mutation DeleteProductVariants($productId: ID!) {
//           deleteManyProductVariants(where: { product: { id: $productId } }) {
//             count
//           }
//         }
//       `,
//       { productId }
//     );

//     // Finally, delete the image URLs associated with the product
//     await client.request(
//       `
//         mutation DeleteImageUrls($productId: ID!) {
//           deleteManyImageUrls(where: { product: { id: $productId } }) {
//             count
//           }
//         }
//       `,
//       { productId }
//     );

//     // Now, delete the product itself
//     const deletedProduct = await client.request(
//       `
//         mutation DeleteProduct($productId: ID!) {
//           deleteProduct(where: { id: $productId }) {
//             id
//           }
//         }
//       `,
//       { productId }
//     );

//     console.log(deletedProduct);

//     return new Response(JSON.stringify(deletedProduct.deleteProduct));
//   } catch (error) {
//     console.error("Error in POST:", error);
//     return new Response(JSON.stringify({ status: 500, body: error.message }));
//   }
// }

// import { GraphQLClient } from "graphql-request";

// export async function POST(req) {
//   const productId = await req.json();
//   const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
//     headers: {
//       authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
//     },
//   });

//   try {//TODO: When delete product, delete its variants, tags, and imageUrls
//     const deletedProduct = await client.request(
//       `
//         mutation DeleteProduct($productId: ID!) {
//           deleteProduct(where: {id: $productId}) {
//             id
//           }
//         }
//       `,
//       { productId }
//     );
    
//     return new Response(JSON.stringify(deletedProduct.deleteProduct)); // Should return the post's title
//   } catch (error) {
//     console.error("Error in POST:", error);
//     return new Response({status:500, body: error.message});
//   }
// }
