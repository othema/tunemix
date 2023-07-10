import { Group, Autocomplete, Button } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { FormEvent, useEffect, useState } from "react";
import { suggest } from "../lib/youtube";
import { useDebouncedState } from "@mantine/hooks";
import { ipcRenderer } from "electron";

export default function Search({ searchCallback, setLoading }: { searchCallback?: (results: any) => void, setLoading?: (loading: boolean) => void }) {
  const [query, setQuery] = useDebouncedState("", 50);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    (async () => {
      const trim = query.trim();
      if (trim === "") return;
      setSuggestions(await suggest(trim));
    })();
  }, [query]);

  async function onSearchSubmit(event: FormEvent) {
    event.preventDefault();
    if (!searchCallback) return;
    if (!query) return;
    if (setLoading) setLoading(true);
    const result = await ipcRenderer.invoke("search", query);
    searchCallback(result);
    if (setLoading) setLoading(false);
  }

  return (
    <form onSubmit={onSearchSubmit}>
      <Group noWrap>
        <Autocomplete
          sx={{ flexGrow: 1 }}
          placeholder="Search or paste URL"
          icon={<IconSearch size={16} />}
          defaultValue={query}
          onChange={setQuery}
          data={suggestions}
        />
        <Button variant="light" type="submit">Search</Button>
      </Group>
    </form>
  );
}