import GET_CONTACT_QUERY from "./query/getContact.graphql?raw";
import { executeGraphQL } from "../../graphqlClient";
import type { GetContactQuery, GetContactQueryVariables } from "../../../graphql-operations-types";

export type ContactDataResult = GetContactQuery["uiapi"]["query"]["Contact"]["edges"][0]["node"];

export async function getContact(contactId: string): Promise<ContactDataResult | null> {
    const data = await executeGraphQL<GetContactQuery, GetContactQueryVariables>(
        GET_CONTACT_QUERY,
        { contactId }
    );
    
    return data?.uiapi?.query?.Contact?.edges?.[0]?.node || null;
}
