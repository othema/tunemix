import { Center, Modal, RingProgress, Stack, Text, ThemeIcon, useMantineTheme } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { ReactNode } from "react";

export default function LoadingModal({ opened, close, progress, bottomSection }:
                                     { opened: boolean, close: () => void, progress: number, bottomSection: ReactNode }) {
  const theme = useMantineTheme();
  return (
    <Modal
      opened={opened}
      withCloseButton={progress >= 100}
      onClose={close}
      closeOnEscape={progress >= 100}
      closeOnClickOutside={progress >= 100}
      centered
      size="xs"
      radius="md"
    >
      <Stack align="center" pb="md">
        <RingProgress
          sections={[{ value: progress, color: progress >= 100 ? "teal" : theme.primaryColor }]}
          label={
            progress >= 100 ? (
              <Center>
                <ThemeIcon color="teal" variant="light" radius="xl" size="xl">
                  <IconCheck size={22} />
                </ThemeIcon>
              </Center>
            ) : (
              <Text color={theme.primaryColor} weight={700} align="center" size="xl">{progress}%</Text>
            )
          }
        />
        {bottomSection}
      </Stack>
    </Modal>
  );
}