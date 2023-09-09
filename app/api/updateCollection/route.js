import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  const {
    name,
    description,
    price,
    state,
    imageUrl,
    products,
    prevProducts,
    id,
  } = body;
  console.log("\n\nproducts in api: \n\n", products);
  console.log("\n\nprevProducts in api: \n\n", prevProducts);
  try {//TODO: Fix
    const updatedCollection = await client.request(
      `
        mutation UpdateCollection(
          $id: ID!,
          $name: String!, 
          $state: ProductStates!, 
          $description: String!, 
          $price: Float!, 
          $products: [ProductConnectInput!],
          $prevProducts: [ProductWhereUniqueInput!]!
          $imageUrl: String
        ) {
          updateCollection(
            where: {id: $id},
            data: {
              name: $name, 
              state: $state, 
              description: $description, 
              price: $price, 
              products: {connect: $products, disconnect: $prevProducts}
              imageUrl: $imageUrl
            }) {
            id
          }
        }
      `,
      {
        id,
        name,
        description,
        price,
        state,
        imageUrl,
        products,
        prevProducts,
      }
    );
    // const updatedCollection = await client.request(
    //   `
    //     mutation UpdateCollection(
    //       $id: ID!,
    //       $name: String!, 
    //       $state: ProductStates!, 
    //       $description: String!, 
    //       $price: Float!, 
    //       ${products.length > 0 ? "$products: [ProductConnectInput!]," : ""}
    //       ${
    //         prevProducts.length > 0
    //           ? "$prevProducts: [ProductWhereUniqueInput!]!"
    //           : ""
    //       }
    //       ${imageUrl ? "$imageUrl: String" : ""}
    //     ) {
    //       updateCollection(
    //         where: {id: $id},
    //         data: {
    //           name: $name, 
    //           state: $state, 
    //           description: $description, 
    //           price: $price, 
    //           ${(products.length > 0 || prevProducts.length > 0) ?
    //             `products: {${
    //               products.length > 0 ? "connect: $products, " : ""
    //             }
    //             ${
    //               prevProducts.length > 0
    //                 ? "disconnect: $prevProducts"
    //                 : ""
    //             }}`
    //             : ""
    //           } 
    //           ${imageUrl ? "imageUrl: $imageUrl" : ""}
    //         }) {
    //         id
    //       }
    //     }
    //   `,
    //   {
    //     id,
    //     name,
    //     description,
    //     price,
    //     state,
    //     imageUrl,
    //     products,
    //     prevProducts,
    //   }
    // );
    return new Response(JSON.stringify(updatedCollection));

  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({ status: 500, body: error.message });
  }
}
