import { Aside, Button, Divider, FileButton, Group, Image, Loader, ScrollArea, Space, Text, Textarea } from "@mantine/core";
import PlaylistSong from "./PlaylistSong";
import { IconArrowsShuffle, IconFolder, IconMusic, IconTrash } from "@tabler/icons-react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useState } from "react";
import { render } from "../lib/render";
import LoadingModal from "./LoadingModal";
import { shell } from "electron";
import { useContextMenu } from "mantine-contextmenu";
import { v4 as uuid } from "uuid";

export default function ShellAside({ playlist, playlistHandlers }: { playlist: any[], playlistHandlers: any }) {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [name, setName] = useState("");
  const [finalPath, setFinalPath] = useState<string | null>(null);
  const showContextMenu = useContextMenu();

  function onRemoveSong(song: any) {
    console.log("hi");
    playlistHandlers.filter((s: any) => s !== song);
  }

  async function openFile() {
    console.log(finalPath)
    if (!finalPath) return;
    shell.showItemInFolder(finalPath)
  }

  function reset() {
    setPercent(0);
    setLoading(false);
    setFinalPath(null);
  }

  function shuffle() {
    playlistHandlers.setState([...playlist].map((_, i, arrCopy) => {
      let rand = i + (Math.floor(Math.random() * (arrCopy.length - i)));
      [arrCopy[rand], arrCopy[i]] = [arrCopy[i], arrCopy[rand]]
      return arrCopy[i]
    }));
  }

  function clear() {
    playlistHandlers.setState([]);
  }

  const items = playlist.map((item, index) => {
    const dragId = uuid();
    return (
      <Draggable key={dragId} index={index} draggableId={dragId}>
        {(provided, snapshot) => (
          <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
            <PlaylistSong data={item} onRemove={onRemoveSong} />
          </div>
        )}
      </Draggable>
    );
  });

  return (
    <Aside
      fixed
      width={{ base: "50%" }}
      sx={(theme) => ({
        backgroundColor: theme.colors.dark[8]
      })}
      p="md"
    >
      <LoadingModal
        opened={loading}
        close={reset}
        progress={percent}
        bottomSection={percent >= 100 ? (
          <>
            <Button
              leftIcon={<IconFolder size={16} />}
              onClick={openFile}
              variant="default"
            >
              Show in folder
            </Button>
          </>
        ) : (
          <Group mt={-10} spacing="xs">
            <Loader size="sm" />
            <Text size="sm" sx={{ verticalAlign: "middle" }} >Loading...</Text>
          </Group>
        )}
      />
      <Aside.Section>
        <Group noWrap align="start">
          <div>
            <Image src={image ? URL.createObjectURL(image) : null} withPlaceholder width={80} height={80} mb="xs" radius="sm" fit="cover" />
            <FileButton onChange={(f: File) => f ? setImage(f): null} accept="image/png,image/jpeg">
              {(props) => <Button {...props} compact fullWidth variant="default">Change</Button>}
            </FileButton>
          </div>
          <div style={{ flexGrow: 1 }}>
            {/* <TextInput variant="unstyled" size="lg" placeholder="Playlist name" /> */}
            <Textarea
              variant="unstyled"
              size="md"
              placeholder="Playlist name"
              autosize
              maxRows={2}
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </div>
        </Group>
      </Aside.Section>

      <Divider my="md" />
      <Button.Group mb="md">
        <Button compact variant="default" fullWidth onClick={shuffle} disabled={playlist.length < 2} leftIcon={<IconArrowsShuffle size={16} />}>Shuffle</Button>
        <Button compact variant="default" fullWidth onClick={clear} disabled={playlist.length === 0} leftIcon={<IconTrash size={16} />}>Clear</Button>
      </Button.Group>
      <Aside.Section
        grow
        component={ScrollArea}
        onContextMenu={showContextMenu([
          {
            key: "shuffle",
            icon: <IconArrowsShuffle size={16} />,
            title: "Shuffle",
            onClick: shuffle,
            disabled: playlist.length < 2
          },
          {
            key: "clear",
            icon: <IconTrash size={16} />,
            title: "Clear",
            onClick: clear,
            color: "red",
            disabled: playlist.length === 0
          }
        ])}
      >
        
        <DragDropContext onDragEnd={({destination, source}) => playlistHandlers.reorder({ from: source.index, to: destination?.index || 0 })}>
          <Droppable droppableId="playlist-list" direction="vertical">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {items}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Aside.Section>
      
      <Space my="xs" />
      <Aside.Section>
        <Button
          fullWidth 
          leftIcon={<IconMusic size={20} />}
          disabled={!(image && playlist.length > 0)}
          loading={loading}
          onClick={() => {
            if (!image) return;
            render(
              image.path,
              playlist,
              name,
              (p: number) => setPercent(p),
              (path: string) => {
                setFinalPath(path);
              },
              reset
            );
            setLoading(true);
          }}
        >
          Render
        </Button>
      </Aside.Section>
    </Aside>
  );
}
