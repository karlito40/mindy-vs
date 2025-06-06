import { __ctask } from "../config";
import { resolveTaskState } from "./resolveTaskState";

let currentId = 0;
const ID = () => String(++currentId);

// TODO: Use custom user indentation instead
// const config = vscode.workspace.getConfiguration('editor');
// const tabSize = config.get<number>('tabSize');
// const insertSpaces = config.get<boolean>('insertSpaces');

const SPACE_DELIMITER = "SPACE";
const DELIMITER_WIDTH = 2;

export function textToNodes(text: string) {
  const [mainTopic, ...lines] = text
    .split("\n")
    .filter((line) => line.trim().length);
  if (!mainTopic) {
    return;
  }

  const rootChapter = makeNode(mainTopic.split("-")[1]);

  let lastDepth = 0;
  const lastChapterByDepths = {
    [lastDepth]: rootChapter,
  };

  let targetedChapter = rootChapter;
  for (const line of lines) {
    const [spaces, topic] = line.split("-");
    const depth = spaces.length / DELIMITER_WIDTH;
    const formattedTopic = topic.trim();
    const taskState = resolveTaskState(formattedTopic);
    const taskConfig = __ctask(taskState);
    const node = {
      id: ID(),
      topic: formattedTopic,
      children: [],
      style: taskConfig.color && {
        color: taskConfig.color,
      },
    };
    lastChapterByDepths[depth] = node;

    // lorsque la profondeur change, le chapitre de référence change également
    if (lastDepth !== depth) {
      targetedChapter = lastChapterByDepths[depth - 1] || rootChapter;
    }

    lastDepth = depth;
    targetedChapter.children.push(node);
  }

  return {
    nodeData: rootChapter,
  };
}

type MindoNode = {
  id: string;
  topic: string;
  children: MindoNode[];
};
function makeNode(text: string): MindoNode {
  return {
    id: ID(),
    topic: text,
    children: [],
  };
}
