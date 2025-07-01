import {Button, DataList, Flex, Heading } from "@radix-ui/themes";
import {getApplication, updateApplication} from "@/api/application";
import {redirect} from "next/navigation";
import Form from "next/form";

export default async function ReviewPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const {id} = await params;
  const {patient_age, patient_gender, therapist_minority_competence} = await getApplication(id);

  const handleSubmit = async () => {
    "use server";
    await updateApplication(id, { application_submitted: true })
    redirect('/');
  }

  return <>
      <Form action={handleSubmit}>
        <Flex direction="column" gap="3">
          <Heading>Review your application before submitting</Heading>
          <DataList.Root>
            <DataList.Item>
              <DataList.Label>Patient age</DataList.Label>
              <DataList.Value>{patient_age}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>Patient gender</DataList.Label>
              <DataList.Value>{patient_gender}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>Therapist minority competence</DataList.Label>
              <DataList.Value>{therapist_minority_competence.join(', ')}</DataList.Value>
            </DataList.Item>
          </DataList.Root>
          <Button type='submit'>Submit</Button>
        </Flex>
      </Form>
  </>
}