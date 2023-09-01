

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
        if(variant.quantity) variantInput.quantity = variant.quantity;
        return variantInput;
      }),
    };
  }

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
    });
    return new Response(JSON.stringify(createdProduct));
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response(JSON.stringify({ status: 500, body: error.message }), { status: 500 });
  }

}
