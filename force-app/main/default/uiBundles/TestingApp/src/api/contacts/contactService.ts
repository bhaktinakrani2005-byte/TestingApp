import { executeGraphQL } from '../graphqlClient';

export interface ContactData {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
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
                  FirstName @optional { value }
                  LastName @optional { value }
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
      firstName: edge.node.FirstName?.value,
      lastName: edge.node.LastName?.value,
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

export async function updateContact(
  contactId: string,
  values: Partial<Omit<ContactData, 'id' | 'cases' | 'accountName' | 'accountIndustry' | 'accountPhone' | 'name'>>
): Promise<ContactData | null> {
  try {
    const mutation = `
      mutation UpdateContact($input: ContactUpdateInput!) {
        uiapi(input: { allOrNone: true }) {
          ContactUpdate(input: $input) {
            Record {
              Id
              Name @optional { value }
              FirstName @optional { value }
              LastName @optional { value }
              Email @optional { value }
              AccountId @optional { value }
              Title @optional { value }
            }
          }
        }
      }
    `;

    // Map fields from the flat input to the structure expected by Salesforce ContactUpdateInput
    const contactFields: Record<string, any> = {};
    if (values.firstName !== undefined) contactFields.FirstName = values.firstName;
    if (values.lastName !== undefined) contactFields.LastName = values.lastName;
    if (values.email !== undefined) contactFields.Email = values.email;
    if (values.accountId !== undefined) contactFields.AccountId = values.accountId;
    if (values.title !== undefined) contactFields.Title = values.title;

    const result = await executeGraphQL<any, { input: any }>(mutation, {
      input: {
        Id: contactId,
        Contact: contactFields
      }
    });

    const record = result?.uiapi?.ContactUpdate?.Record;
    if (!record) return null;

    return {
      id: record.Id,
      name: record.Name?.value,
      firstName: record.FirstName?.value,
      lastName: record.LastName?.value,
      email: record.Email?.value,
      accountId: record.AccountId?.value,
      title: record.Title?.value,
      accountName: '', 
      accountIndustry: '',
      accountPhone: '',
      cases: []
    };
  } catch (error) {
      console.error('Error updating contact:', error);
      throw error; // Re-throw so the UI can handle/display the error
    }
  }

export async function deleteContact(contactId: string): Promise<boolean> {
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

    return !!result?.uiapi?.ContactDelete?.deletedRecordId;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}