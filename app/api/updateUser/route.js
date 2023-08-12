import { GraphQLClient } from "graphql-request";

/** *************************************************************
* Any file inside the folder app/api is mapped to /api/* and  *
* will be treated as an API endpoint instead of a page.         *
*************************************************************** */

// export a default function for API route to work

export async function POST(req) {
  const body = await req.json(); 
  console.log("body: ", body);

  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });
  try {
    const { firstName, lastName, userId, location, imgUrl } = body;
    const updatedUser = await client.request(
      `
        mutation UpdateTheUser(
          $userId: ID!, 
          $location: String!, 
          $firstName: String!, 
          $lastName: String!, 
          $imgUrl: String!
        ) 
          {
            updateTheUser(
              data: {
                location: $location, 
                firstName: $firstName, 
                lastName: $lastName, 
                profileImageUrl: $imgUrl
              }
              where: {id: $userId}
            ) 
          {
            location
            firstName
            id
            lastName
            profileImageUrl
          }
        }
      `,
      {
        location,
        firstName,
        userId,
        lastName,
        imgUrl
      }
    );
    return new Response(JSON.stringify(updatedUser));
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
