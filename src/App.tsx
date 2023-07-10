import { AppShell, Center, Divider, Loader, Stack } from "@mantine/core";
import ShellAside from "./components/ShellAside";
import Search from "./components/Search";
import { useState } from "react";
import Result from "./components/Result";
import { useListState } from "@mantine/hooks";
import { v4 as uuid } from "uuid";

function App() {
  const [results, setResults] = useState<any[]>([]);
  const [playlist, playlistHandlers] = useListState<any>([]);
  const [loading, setLoading] = useState(false);

  function onAddSong(song: any) {
    playlistHandlers.append(song)
  }

  return (
    <AppShell
      aside={<ShellAside playlist={playlist} playlistHandlers={playlistHandlers} />}
    >
      <Search searchCallback={(results) => setResults(results)} setLoading={setLoading} />
      <Divider my="md" />

      {!loading ? (
        <Stack spacing="xs">
          {results.map((result: any) => (
            playlist.indexOf(result) === -1 ? <Result key={uuid()} data={result} onAdd={onAddSong} /> : null
          ))}
        </Stack>
      ) : (
        <Center mt="xl">
          <Loader />
        </Center>
      )}
    </AppShell>
  );
}

export default App;
