import {Button, Flex, Grid, Heading, RadioCards} from "@radix-ui/themes";
import {getApplication, updateApplication} from "@/api/application";
import {redirect} from "next/navigation";
import Form from "next/form";

export default async function PatientGenderPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const {id} = await params;
  const {patient_gender} = await getApplication(id);

  const handleSubmit = async (formData: FormData) => {
    "use server";

    await updateApplication(id, {
      current_page: 'therapist_minority_competence',
      patient_gender: formData.get('patient_gender')
    })
    redirect(`/${id}/therapist_minority_competence`);
  }

  const handleChange = async (patient_gender: string) => {
    "use server";
    await updateApplication(id, { patient_gender })
  }

  return <>
    <Form action={handleSubmit}>
      <Flex direction="column" gap="3">
        <Heading>What gender do you identify as?</Heading>
        <RadioCards.Root onValueChange={handleChange} defaultValue={patient_gender} name='patient_gender'>
          <Grid columns="3" gap='2'>
            <RadioCards.Item value='woman'>Woman</RadioCards.Item>
            <RadioCards.Item value='man'>Man</RadioCards.Item>
            <RadioCards.Item value='nonbinary'>Non-binary</RadioCards.Item>
          </Grid>
        </RadioCards.Root>
        <Button type='submit'>Next</Button>
      </Flex>
    </Form>
  </>
}