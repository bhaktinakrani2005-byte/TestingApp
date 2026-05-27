import { executeGraphQL } from '../graphqlClient';

export interface ContactData {
  id: string;
  name: string;
  email: string;
  accountId: string;
  title: string;
  accountName: string;
  accountIndustry?: string;
  accountPhone?: string;
  cases: Array<{ id: string; caseNumber: string; subject: string; status?: string; priority?: string }>;
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
                  Name @optional { value }
                  Email @optional { value }
                  AccountId @optional { value }
                  Title @optional { value }
                  Account @optional {
                    Name @optional { value }
                    Industry @optional { value }
                    Phone @optional { value }
                  }
                  Cases @optional {
                    edges {
                      node {
                        Id
                        CaseNumber @optional { value }
                        Subject @optional { value }
                        Status @optional { value }
                        Priority @optional { value }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await executeGraphQL<any, { contactId: string }>(query, { contactId });
    const edge = result?.uiapi?.query?.Contact?.edges?.[0];
    console.log('edge result is', edge);

    if (!edge) return null;

    return {
      id: edge.node.Id,
      name: edge.node.Name?.value,
      email: edge.node.Email?.value,
      accountId: edge.node.AccountId?.value,
      title: edge.node.Title?.value,
      accountName: edge.node.Account?.Name?.value,
      accountIndustry: edge.node.Account?.Industry?.value,
      accountPhone: edge.node.Account?.Phone?.value,
      cases: edge.node.Cases?.edges?.map((caseEdge: any) => ({
        id: caseEdge.node.Id,
        caseNumber: caseEdge.node.CaseNumber?.value,
        subject: caseEdge.node.Subject?.value,
        status: caseEdge.node.Status?.value,
        priority: caseEdge.node.Priority?.value
      })) || []
    };

  } catch (error) {
    console.error(error);
    return null;
  }
}


export async function getAllContacts() {
  try {
    const query = `
        query GetContacts {
          uiapi {
            query {
              Contact(first: 50) {
                edges {
                  node {
                    Id
                    
                    Name {
                      value
                    }

                    Email {
                      value
                    }

                    Title {
                      value
                    }
                  }
                }
              }
            }
          }
        }
      `;

    const result: any = await executeGraphQL(query);

    console.log("GRAPHQL RESULT", result);
    // result?.uiapi?.query?.Contact?.edges?.map((edge: any) => ({
    //   id: edge.node.Id,
    //   name: edge.node.Name?.value,
    //   email: edge.node.Email?.value,
    //   title: edge.node.Title?.value,
    // }))

    const data = result?.uiapi?.query?.Contact?.edges?.map((edge: any) => {
      return ({
        id: edge.node.Id,
        name: edge.node.Name?.value,
        email: edge.node.Email?.value,
        title: edge.node.Title?.value,
      })

    })

    return data || [];

  } catch (error) {

    console.error("GRAPHQL ERROR", error);

    return [];
  }
}

export async function getDistinctCaseStatus() {
  try {
    const query = `
      query DistinctCaseStatus {
        uiapi {
          aggregate {
            Case(groupBy: { Status: { group: true } }) {
              edges {
                node {
                  aggregate {
                    Status {
                      value
                      displayValue
                      label
                    }
                    count { value }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await executeGraphQL(query);

    return (
      (result as any)?.uiapi?.aggregate?.Case?.edges?.map(
        (edge: any) => ({
          status: edge?.node?.aggregate?.Status?.label,
          count: edge?.node?.aggregate?.count?.value
        })
      ) || []
    );
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateContact(
  contactId: string,
  values: Partial<Omit<ContactData, 'id' | 'cases' | 'accountName' | 'accountIndustry' | 'accountPhone'>>
): Promise<Partial<ContactData> | null> {
  try {
    const mutation = `
      mutation UpdateContact($input: ContactUpdateInput!) {
        uiapi(input: { allOrNone: true }) {
          ContactUpdate(input: $input) {
            Record {
              Id
              Name @optional { value }
              Email @optional { value }
              AccountId @optional { value }
              Title @optional { value }
            }
          }
        }
      }
    `;

    // Map fields from the flat input to the structure expected by Salesforce ContactUpdateInput.
    // Since Name is a read-only compound field in Salesforce, we must update FirstName and LastName instead.
    const contactFields: Record<string, any> = {};
    if (values.name) {
      const parts = values.name.trim().split(/\s+/);
      if (parts.length > 1) {
        contactFields.FirstName = parts[0];
        contactFields.LastName = parts.slice(1).join(' ');
      } else {
        contactFields.LastName = parts[0];
      }
    }
    if (values.email) contactFields.Email = values.email;
    if (values.accountId) contactFields.AccountId = values.accountId;
    if (values.title) contactFields.Title = values.title;

    const result = await executeGraphQL<any, { input: any }>(mutation, {
      input: {
        Id: contactId,
        Contact: contactFields
      }
    });

    const record = result?.uiapi?.ContactUpdate?.Record;
    if (!record) return null;

    // Note: This returns a partial ContactData as we only requested basic fields in the mutation response
    return {
      id: record.Id,
      name: record.Name?.value,
      email: record.Email?.value,
      accountId: record.AccountId?.value,
      title: record.Title?.value
    };
  } catch (error) {
    console.error('Error updating contact:', error);
    return null;
  }
}

export async function deleteContact(contactId: string) {
  try {
    const mutation = `
      mutation DeleteContact($input: ContactDeleteInput!) {
        uiapi(input: { allOrNone: true }) {
          ContactDelete(input: $input) {
            deletedRecordId
          }
        }
      }
    `;

    const result = await executeGraphQL<any, { input: any }>(mutation, {
      input: {
        Id: contactId
      }
    });

    const deletedRecordId = result?.uiapi?.ContactDelete?.deletedRecordId;
    if (!deletedRecordId) return null;

    return {
      id: deletedRecordId
    };
  } catch (error) {
    console.error('Error deleting contact:', error);
    return null;
  }
}