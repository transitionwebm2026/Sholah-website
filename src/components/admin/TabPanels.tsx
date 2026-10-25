'use client';

import {useState, type ReactNode} from 'react';
import {Tabs} from './ui';

/**
 * Tabs whose panels stay mounted once opened, so switching tabs never drops unsaved edits.
 * Panels mount on first visit, so a page only loads what is actually opened.
 */
export function TabPanels({tabs}: {tabs: Array<{id: string; label: string; content: ReactNode}>}) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const [visited, setVisited] = useState<string[]>(() => [tabs[0]?.id ?? '']);

  return (
    <>
      <Tabs
        tabs={tabs}
        active={active}
        onChange={(id) => {
          setActive(id);
          setVisited((list) => (list.includes(id) ? list : [...list, id]));
        }}
      />
      {tabs.map((tab) =>
        visited.includes(tab.id) ? (
          <div key={tab.id} role="tabpanel" hidden={tab.id !== active}>
            {tab.content}
          </div>
        ) : null
      )}
    </>
  );
}
