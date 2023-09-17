

import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  const {
    name, slug, description, price, state, imgUrls, excerpt, categories, variants, collections, isOnSale, previousPrice
  } = body;

  let variantInput = {};
  if (variants.length > 0) {
    variantInput = {
      create: variants.map((variant) => {
        const variantInput = {};
        if (variant.size) {
          variantInput.name = variant.size;
        }
        if (variant.color) {
          variantInput.name = `${variantInput.name}/${variant.color}`
        }
        if(variant.quantity) variantInput.quantity = variant.quantity;
        return variantInput;
      }),
    };
  }
  console.log("variantInput: ", variantInput);//TODO:FIX
  const query = `
    mutation CreateProduct(
      $name: String!
      $excerpt: String!
      $description: String!
      $price: Float!
      $state: ProductStates!
      $slug: String!
      $imageUrls: [ImageUrlCreateInput!]
      $isOnSale: Boolean!
      $previousPrice: Float
      $variants: ProductVariantCreateManyInlineInput
      $categories: [CategoryWhereUniqueInput!]
      $collection: [CollectionWhereUniqueInput!]
    ) {
      createProduct(
        data: {
          name: $name
          excerpt: $excerpt
          description: $description
          price: $price
          state: $state
          slug: $slug
          imageUrls: { create: $imageUrls }
          isOnSale: $isOnSale
          previousPrice: $previousPrice
          productVariants: $variants
          categories: { connect: $categories }
          collections: { connect: $collection }
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
      collection: collections.map((collection) => ({ id: collection })),
      variants: variantInput,
      isOnSale, 
      previousPrice
    });
    return new Response(JSON.stringify(createdProduct.createProduct));
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response(JSON.stringify({ status: 500, body: error.message }), { status: 500 });
  }

}
