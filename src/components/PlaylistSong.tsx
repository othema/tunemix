import { Card, Image, Group, Text, useMantineTheme, ActionIcon } from "@mantine/core";
import { IconClock, IconCopy, IconExternalLink, IconEye, IconTrash } from "@tabler/icons-react";
import { useContextMenu } from "mantine-contextmenu";
import { clipboard, shell } from "electron";

export default function PlaylistSong({ data, onRemove }: { data: any, onRemove?: (result: any) => void }) {
  const theme = useMantineTheme();
  const showContextMenu = useContextMenu();
  const link = "https://www.youtube.com" + data.url_suffix;

  return (
    <Card
      p={0}
      withBorder
      onContextMenu={showContextMenu([
        {
          key: "copy",
          icon: <IconCopy size={16} />,
          title: "Copy link to clipboard",
          onClick: () => clipboard.writeText(link)
        },
        {
          key: "open",
          icon: <IconExternalLink size={16} />,
          title: "Open in browser",
          onClick: () => shell.openExternal(link)
        },
        { key: "divider" },
        {
          key: "remove",
          icon: <IconTrash size={16} />,
          title: "Remove from playlist",
          onClick: () => onRemove ? onRemove(data) : null,
          color: "red"
        }
      ])}
      sx={{
        overflow: "hidden",
        cursor: "pointer",
        transition: "100ms ease",
        boxShadow: theme.shadows.xs,
        maxHeight: 60,
        "&:hover": {
          backgroundColor: theme.colors.dark[5]
        },
        marginBottom: theme.spacing.xs
      }}
    >
      <Group noWrap align="start">
        <Image
          src={data.thumbnails[0]}
          width={60}
          height={60}
          alt="Thumbnail"
        />
        <div style={{ padding: `${theme.spacing.xs} 0 ${theme.spacing.xs} 0`, flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
          <Text size="xs" lineClamp={1}>{data.title}</Text>
          <Group noWrap spacing="xl">
            <Group noWrap spacing={5}>
              <IconClock size={14} />
              <Text size="xs">{data.duration}</Text>
            </Group>
            <Group noWrap spacing={5}>
              <IconEye size={14} />
              <Text size="xs">{data.views}</Text>
            </Group>
          </Group>
        </div>
        <ActionIcon size="sm" radius="xl" onClick={() => onRemove ? onRemove(data) : null} sx={{ alignSelf: "center", marginRight: theme.spacing.xs }} color={theme.primaryColor}>
          <IconTrash />
        </ActionIcon>
      </Group>
    </Card>
  );
}
