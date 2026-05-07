import { executeGraphQL } from '../graphqlClient';

export interface ContactData {
  id: string;
  name: string;
  email: string;
  accountId: string;
  title: string;
}

export async function getContact(contactId: string): Promise<ContactData | null> {
  try {
    const query = `
      query getContact($contactId: ID!) {
        uiapi {
          query {
            Contact(where: { Id: { eq: $contactId } }) {
              edges {
                node {
                  Id
                  Name { value }
                  Email { value }
                  AccountId { value }
                  Title { value }
                }
              }
            }
          }
        }
      }
    `;

    const result = await executeGraphQL<any, { contactId: string }>(query, { contactId });
    const edge = result?.uiapi?.query?.Contact?.edges?.[0];
    console.log('edge result is',edge);

    if (!edge) return null;

    return {
      id: edge.node.Id,
      name: edge.node.Name?.value,
      email: edge.node.Email?.value,
      accountId: edge.node.AccountId?.value,
      title: edge.node.Title?.value,
    };

  } catch (error) {
    console.error(error);
    return null;
  }
}