import {Button, Flex, Grid, Heading, RadioCards} from "@radix-ui/themes";
import {getApplication, updateApplication} from "@/api/application";
import {redirect} from "next/navigation";
import Form from "next/form";

export default async function PatientAgePage({params}: Readonly<{ params: Promise<{ id: string }> }>) {
  const {id} = await params;
  const {patient_age} = await getApplication(id);

  const handleSubmit = async (formData: FormData) => {
    "use server";
    await updateApplication(id, {
      current_page: 'patient_gender',
      patient_age: formData.get('patient_age')
    })
    redirect(`/${id}/patient_gender`);
  }

  const handleChange = async (patient_age: string) => {
    "use server";
    await updateApplication(id, {patient_age})
  }

  return <>
      <Form action={handleSubmit}>
        <Flex direction="column" gap="3">
          <Heading>How old are you?</Heading>
          <RadioCards.Root onValueChange={handleChange} defaultValue={patient_age} name='patient_age'>
            <Grid columns="3" gap="2">
              <RadioCards.Item value='18-25'>18-25</RadioCards.Item>
              <RadioCards.Item value='26-35'>26-35</RadioCards.Item>
              <RadioCards.Item value='36-45'>36-45</RadioCards.Item>
              <RadioCards.Item value='46-55'>46-55</RadioCards.Item>
              <RadioCards.Item value='56-65'>56-65</RadioCards.Item>
              <RadioCards.Item value='over_65'>Over 65</RadioCards.Item>
            </Grid>
          </RadioCards.Root>
          <Button type='submit'>Next</Button>
        </Flex>
      </Form>
  </>
}