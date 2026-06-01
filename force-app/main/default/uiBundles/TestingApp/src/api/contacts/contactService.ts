
import { toast } from 'sonner';
import { executeGraphQL } from '../graphqlClient';
import { newContactInput, newContactResponse } from "@/store/slice/ContactSlice";

export interface ContactData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
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
      firstName: edge.node.FirstName?.value ?? '',
      lastName: edge.node.LastName?.value ?? '',
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


export interface ContactCreateInput {
  firstName?: string;
  lastName: string;
  email?: string;
  title?: string;
}

export async function createContact(
  contactData: newContactInput
): Promise<newContactResponse | null> {

  try {

    const mutation = `
      mutation CreateContact($input: ContactCreateInput!) {
        uiapi {
          ContactCreate(input: $input) {
            Record {
              Id
              FirstName @optional { value }
              LastName @optional { value }
              Email @optional { value }
              Title @optional { value }
            }
          }
        }
      }
    `;

    // FIELD VALIDATION
    const FIELD_LIMITS = {
      firstName: 15,
      lastName: 15,
      email: 30,
      title: 20,
    };

    const fieldsToValidate = {
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      title: contactData.title,
    };

    for (const [key, value] of Object.entries(fieldsToValidate)) {

      if (!value) continue;

      const maxLength =
        FIELD_LIMITS[key as keyof typeof FIELD_LIMITS];

      if (value.length > maxLength) {
        toast.error(`${key} cannot exceed ${maxLength} characters`);
        throw new Error(
          `${key} cannot exceed ${maxLength} characters`
        );
      }
    }

    const variables = {
      input: {
        Contact: {
          FirstName: contactData.firstName,
          LastName: contactData.lastName,
          Email: contactData.email,
          Title: contactData.title,
        },
      },
    };

    console.log("variables :", variables);

    const result = await executeGraphQL<any, typeof variables>(
      mutation,
      variables
    );

    console.log("result :", result);

    const record = result?.uiapi?.ContactCreate?.Record;

    if (!record) {
      return null;
    }

    return {
      id: record.Id,
      firstName: record.FirstName?.value || "",
      lastName: record.LastName?.value || "",
      email: record.Email?.value || "",
      title: record.Title?.value || "",
    };

  } catch (error: any) {

    console.error("createContact error:", error);

    throw new Error(
      error?.message || "Failed to create contact"
    );
  }
}

// export interface CreateContactInput {
//   FirstName?: string;
//   LastName: string;
//   Email?: string;
//   Phone?: string;
//   Title?: string;
// }

// interface CreateContactResponse1 {
//   uiapi: {
//     ContactCreate: {
//       Record: {
//         Id: string;
//         FirstName?: {
//           value: string;
//         };
//         LastName?: {
//           value: string;
//         };
//         Name?: {
//           value: string;
//         };
//         Email?: {
//           value: string;
//         };
//         Phone?: {
//           value: string;
//         };
//         Title?: {
//           value: string;
//         };
//       };
//     };
//   };
// }



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

    const data = result?.uiapi?.query?.Contact?.edges?.map((edge: any) => {
      return ({
        id: edge.node.Id,
        name: edge.node.Name?.value,
        email: edge.node.Email?.value,
        title: edge.node.Title?.value,
        loading: false
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

    // Map fields from the flat input to the structure expected by Salesforce ContactUpdateInput.
    // Since Name is a read-only compound field in Salesforce, we must update FirstName and LastName instead.
    const contactFields: Record<string, any> = {};
    console.log('values are', values);
    if (values.firstName) contactFields.FirstName = values.firstName;
    if (values.lastName) contactFields.LastName = values.lastName;
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
      firstName: record.FirstName?.value,
      lastName: record.LastName?.value,
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
  console.log('delete called from service');
  try {
    const mutation = `
        mutation DeleteContact($input: RecordDeleteInput!) {
          uiapi {
            ContactDelete(input: $input) {
                Id
              }
            }
        }`;
    console.log('id to be deleted');
    const result = await executeGraphQL<any, { input: any }>(
      mutation,
      { input: { Id: contactId } }
    );

    console.log("delete result :", result);

    const deletedRecordId = result?.uiapi?.ContactDelete?.Id;
    if (!deletedRecordId) {
      return null;
    }

    return {
      id: deletedRecordId,
    };
  } catch (error: any) {

    console.error("Error deleting contact:", error);

    const errorMessage =
      error?.message || "Failed to delete contact";

    const lowerError = errorMessage.toLowerCase();

    if (
      lowerError.includes("case") ||
      lowerError.includes("cases") ||
      lowerError.includes("associated") ||
      lowerError.includes("related") ||
      lowerError.includes("delete")
    ) {

      throw new Error(
        "Cannot delete contact because it has related to cases."
      );
    }

    throw new Error(errorMessage);
  }
}

