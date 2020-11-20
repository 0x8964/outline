// @flow
import { keymap } from "prosemirror-keymap";
import { Extension } from "rich-markdown-editor";
import {
  ySyncPlugin,
  yCursorPlugin,
  yUndoPlugin,
  undo,
  redo,
} from "y-prosemirror";
// import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

export default class MultiplayerExtension extends Extension {
  get name() {
    return "multiplayer";
  }

  get plugins() {
    const { user, provider, doc } = this.options;
    const type = doc.get("prosemirror", Y.XmlFragment);

    const assignUser = (tr) => {
      const clientIds = Array.from(doc.store.clients.keys());

      if (
        tr.local &&
        tr.changed.size > 0 &&
        !clientIds.includes(doc.clientID)
      ) {
        const permanentUserData = new Y.PermanentUserData(doc);
        permanentUserData.setUserMapping(doc, doc.clientID, user.id);
        doc.off("afterTransaction", assignUser);
      }
    };

    provider.awareness.setLocalStateField("user", {
      color: user.color,
      name: user.name,
      id: user.id,
    });

    doc.on("afterTransaction", assignUser);

    // const dbProvider = new IndexeddbPersistence(doc.documentId, doc);
    // dbProvider.whenSynced.then(() => {
    //   console.log("loaded data from indexed db");
    // });

    return [
      ySyncPlugin(type),
      yCursorPlugin(provider.awareness),
      yUndoPlugin(),
      keymap({
        "Mod-z": undo,
        "Mod-y": redo,
        "Mod-Shift-z": redo,
      }),
    ];
  }
}
