

import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  const {
    name, slug, description, price, state, imgUrls, excerpt, categories, variants,
  } = body;
  console.log("_____________variants: \n",variants);

  let variantInput = {};
  if (variants.length > 0) {
    variantInput = {
      create: variants.map((variant) => {
        const variantInput = {};
        if (variant.size) {
          variantInput.name = variant.size;
        }
        if (variant.color) {
          variantInput.name = variant.color;
        }
        return variantInput;
      }),
    };
  }
  console.log("variantInput: ", variantInput);

  // ... (previous code remains the same)

  const query = `
    mutation CreateProduct(
      $name: String!
      $slug: String!
      $description: String!
      $price: Float!
      $state: ProductStates!
      $imageUrls: [ImageUrlCreateInput!]
      $excerpt: String!
      $categories: [CategoryWhereUniqueInput!]
      $variants: ProductVariantCreateManyInlineInput
    ) {
      createProduct(
        data: {
          name: $name
          slug: $slug
          description: $description
          price: $price
          state: $state
          imageUrls: { create: $imageUrls }
          productVariants: $variants
          excerpt: $excerpt
          categories: { connect: $categories }
        }
      ) {
        id
        imageUrls {
          id
        }
        productVariants {
          id
        }
      }
    }
  `;

  try {
    const createdProduct = await client.request(query, {
      imageUrls: imgUrls.map((url) => ({ url })),
      name,
      slug,
      description,
      price,
      state,
      excerpt,
      categories: categories.map((category) => ({ id: category })),
      variants: variantInput
      // variants
      // variants: {
      //   create: variants,
      // },
    });
    return new Response(JSON.stringify(createdProduct));
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response(JSON.stringify({ status: 500, body: error.message }), { status: 500 });
  }

}


// import { GraphQLClient } from "graphql-request";

// export async function POST(req) {
//   const body = await req.json();
//   const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
//     headers: {
//       authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
//     },
//   });

//   const {
//     name, slug, description, price, state, imgUrls, excerpt, categories, variants,
//   } = body;

//   let typeOfVariants = "";
//   let variantInputKey = "";

//   if (variants.length > 0) {
//     if (variants[0]?.size && variants[0]?.color) {
//       typeOfVariants = "ProductSizeColorVariant";
//       variantInputKey = "ProductSizeColorVariants";
//     } else if (variants[0]?.size) {
//       typeOfVariants = "ProductSizeVariant";
//       variantInputKey = "ProductSizeVariants";
//     } else if (variants[0]?.color) {
//       typeOfVariants = "ProductColorVariant";
//       variantInputKey = "ProductColorVariants"; //Remove and add s in the query instead??
//     }
//   }

//   const query = `
//     mutation CreateProduct(
//       $name: String!
//       $slug: String!
//       $description: String!
//       $price: Float!
//       $state: ProductStates!
//       $imageUrls: [ImageUrlCreateInput!]
//       $excerpt: String!
//       $categories: [CategoryWhereUniqueInput!]
//       ${variantInputKey ? `$variants: [${typeOfVariants}CreateInput!]` : ''}
//     ) {
//       createProduct(
//         data: {
//           name: $name
//           slug: $slug
//           description: $description
//           price: $price
//           state: $state
//           imageUrls: { create: $imageUrls }
//           ${variantInputKey ? `${variantInputKey}: { create: $variants }` : ''}
//           excerpt: $excerpt
//           categories: { connect: $categories }
//         }
//       ) {
//         id
//         imageUrls {
//           id
//         }
//       }
//     }
//   `;

//   try {
//     const createdProduct = await client.request(query, {
//       imageUrls: imgUrls.map((url) => ({ url })),
//       name,
//       slug,
//       description,
//       price,
//       state,
//       excerpt,
//       categories: categories.map((category) => ({ id: category })),
//       variants: variants.map((variant) => ({
//         size: typeOfVariants === 'ProductSizeVariant' ? variant.size : null,
//         color: typeOfVariants === 'ProductColorVariant' ? variant.color : null,
//       })),
//     });
//     return new Response(JSON.stringify(createdProduct));
//   } catch (error) {
//     console.error("Error in POST:", error);
//     return new Response(JSON.stringify({ status: 500, body: error.message }), { status: 500 });
//   }
// }


// import { GraphQLClient } from "graphql-request";

// export async function POST(req) {
//   const body = await req.json();
//   const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
//     headers: {
//       authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
//     },
//   });
//   const {
//     name, slug, description, price, state, imgUrls, excerpt, categories, variants,
//   } = body;

//   let typeOfVariants = "";
//   let query = "";
//   console.log("variants: ", variants);
//   if(variants.length > 0) {
//     if (variants[0]?.size && variants[0]?.color) {
//       typeOfVariants = "ProductSizeColorVariant";
//       query = `
//         mutation CreateProduct($name: String!, $slug: String!, $description: String!, $price: Float!, $state: ProductStates!, $imageUrls: [ImageUrlCreateInput!], $ProductSizeColorVariants: [ProductSizeColorVariantCreateInput!], $excerpt: String!, $categories: [CategoryWhereUniqueInput!] ) {
//           createProduct(
//             data: { name: $name, slug: $slug, description: $description, price: $price, state: $state, imageUrls: { create: $imageUrls }, ProductSizeColorVariants: { create: $ProductSizeColorVariants } ,excerpt: $excerpt, categories: { connect: $categories } }
//           ) {
//             id
//             imageUrls {
//               id
//             }
//           }
//         }
//       `;
//     }
//     if (variants[0]?.size) {
//       typeOfVariants = "ProductSizeVariant";
//       query = `
//         mutation CreateProduct($name: String!, $slug: String!, $description: String!, $price: Float!, $state: ProductStates!, $imageUrls: [ImageUrlCreateInput!], $ProductSizeVariants: [ProductSizeVariantCreateInput!], $excerpt: String!, $categories: [CategoryWhereUniqueInput!] ) {
//           createProduct(
//             data: { name: $name, slug: $slug, description: $description, price: $price, state: $state, imageUrls: { create: $imageUrls }, ProductSizeVariants: { create: $ProductSizeVariants } ,excerpt: $excerpt, categories: { connect: $categories } }
//           ) {
//             id
//             imageUrls {
//               id
//             }
//           }
//         }
//       `;
//     }
//     if (variants[0]?.color) {
//       typeOfVariants = "ProductColorVariant";
//       query = `
//         mutation CreateProduct($name: String!, $slug: String!, $description: String!, $price: Float!, $state: ProductStates!, $imageUrls: [ImageUrlCreateInput!], $ProductColorVariants: [ProductColorVariantCreateInput!], $excerpt: String!, $categories: [CategoryWhereUniqueInput!] ) {
//           createProduct(
//             data: { name: $name, slug: $slug, description: $description, price: $price, state: $state, imageUrls: { create: $imageUrls }, ProductColorVariants: { create: $ProductColorVariants } ,excerpt: $excerpt, categories: { connect: $categories } }
//           ) {
//             id
//             imageUrls {
//               id
//             }
//           }
//         }
//       `;
//     };
//   } else {
//     query = `
//       mutation CreateProduct($name: String!, $slug: String!, $description: String!, $price: Float!, $state: ProductStates!, $imageUrls: [ImageUrlCreateInput!], $excerpt: String!, $categories: [CategoryWhereUniqueInput!] ) {
//         createProduct(
//           data: { name: $name, slug: $slug, description: $description, price: $price, state: $state, imageUrls: { create: $imageUrls }, excerpt: $excerpt, categories: { connect: $categories } }
//         ) {
//           id
//           imageUrls {
//             id
//           }
//         }
//       }
//     `;
//   }

//   try {
//     //TODO: add variants
//     const createdProduct = await client.request(
//       query,
//       {
//         imageUrls: imgUrls.map((url) => ({ url })),
//         name,
//         slug,
//         description,
//         price,
//         state,
//         excerpt,
//         categories: categories.map((category) => ({ id: category })),
//         variants
//         // variants: variants.map((variant) => ({
//         //   size: variant.size,
//         //   color: variant.color
//         // }))
//       }
//     );
//     return new Response(JSON.stringify(createdProduct)); // Should return the id
//   } catch (error) {
//     console.error("Error in POST:", error);
//     return new Response({ status: 500, body: error.message });
//   }
// }
