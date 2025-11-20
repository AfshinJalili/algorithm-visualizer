import Tracer from './Tracer';
import { distance } from 'common/util';
import { GraphRenderer } from 'core/renderers';
import type LogTracer from './LogTracer';

interface Dimensions {
  baseWidth: number;
  baseHeight: number;
  padding: number;
  nodeRadius: number;
  arrowGap: number;
  nodeWeightGap: number;
  edgeWeightGap: number;
}

interface Node {
  id: number;
  weight: number | null;
  x: number;
  y: number;
  visitedCount: number;
  selectedCount: number;
}

interface Edge {
  source: number;
  target: number;
  weight: number | null;
  visitedCount: number;
  selectedCount: number;
}

type LayoutMethod = (...args: unknown[]) => void;

class GraphTracer extends Tracer {
  dimensions: Dimensions = {
    baseWidth: 320,
    baseHeight: 320,
    padding: 32,
    nodeRadius: 12,
    arrowGap: 4,
    nodeWeightGap: 4,
    edgeWeightGap: 4,
  };
  isDirected: boolean = true;
  isWeighted: boolean = false;
  callLayout: { method: LayoutMethod; args: unknown[] } = { method: this.layoutCircle, args: [] };
  logTracer: LogTracer | null = null;
  nodes: Node[] = [];
  edges: Edge[] = [];

  getRendererClass() {
    return GraphRenderer;
  }

  init() {
    super.init();
    this.nodes = [];
    this.edges = [];
    this.dimensions = {
      baseWidth: 320,
      baseHeight: 320,
      padding: 32,
      nodeRadius: 12,
      arrowGap: 4,
      nodeWeightGap: 4,
      edgeWeightGap: 4,
    };
    this.isDirected = true;
    this.isWeighted = false;
    this.callLayout = { method: this.layoutCircle, args: [] };
    this.logTracer = null;
  }

  set(array2d: unknown[][] = []) {
    this.nodes = [];
    this.edges = [];
    for (let i = 0; i < array2d.length; i++) {
      this.addNode(i);
      for (let j = 0; j < array2d.length; j++) {
        const value = array2d[i][j];
        if (value) {
          this.addEdge(i, j, this.isWeighted ? value : null);
        }
      }
    }
    this.layout();
    super.set();
  }

  directed(isDirected: boolean = true) {
    this.isDirected = isDirected;
  }

  weighted(isWeighted: boolean = true) {
    this.isWeighted = isWeighted;
  }

  addNode(
    id: number,
    weight: number | null = null,
    x: number = 0,
    y: number = 0,
    visitedCount: number = 0,
    selectedCount: number = 0
  ) {
    if (this.findNode(id)) return;
    this.nodes.push({ id, weight, x, y, visitedCount, selectedCount });
    this.layout();
  }

  updateNode(
    id: number,
    weight?: number,
    x?: number,
    y?: number,
    visitedCount?: number,
    selectedCount?: number
  ) {
    const node = this.findNode(id);
    const update: Partial<Node> = { weight, x, y, visitedCount, selectedCount };
    Object.keys(update).forEach(key => {
      if (update[key as keyof Node] === undefined) delete update[key as keyof Node];
    });
    Object.assign(node, update);
  }

  removeNode(id: number) {
    const node = this.findNode(id);
    if (!node) return;
    const index = this.nodes.indexOf(node);
    this.nodes.splice(index, 1);
    this.layout();
  }

  addEdge(
    source: number,
    target: number,
    weight: number | null = null,
    visitedCount: number = 0,
    selectedCount: number = 0
  ) {
    if (this.findEdge(source, target)) return;
    this.edges.push({ source, target, weight, visitedCount, selectedCount });
    this.layout();
  }

  updateEdge(
    source: number,
    target: number,
    weight?: number,
    visitedCount?: number,
    selectedCount?: number
  ) {
    const edge = this.findEdge(source, target);
    const update: Partial<Omit<Edge, 'source' | 'target'>> = {
      weight,
      visitedCount,
      selectedCount,
    };
    Object.keys(update).forEach(key => {
      if (update[key as keyof typeof update] === undefined)
        delete update[key as keyof typeof update];
    });
    Object.assign(edge, update);
  }

  removeEdge(source: number, target: number) {
    const edge = this.findEdge(source, target);
    if (!edge) return;
    const index = this.edges.indexOf(edge);
    this.edges.splice(index, 1);
    this.layout();
  }

  findNode(id: number): Node | undefined {
    return this.nodes.find(node => node.id === id);
  }

  findEdge(
    source: number,
    target: number,
    isDirected: boolean = this.isDirected
  ): Edge | undefined {
    if (isDirected) {
      return this.edges.find(edge => edge.source === source && edge.target === target);
    } else {
      return this.edges.find(
        edge =>
          (edge.source === source && edge.target === target) ||
          (edge.source === target && edge.target === source)
      );
    }
  }

  findLinkedEdges(source: number, isDirected: boolean = this.isDirected): Edge[] {
    if (isDirected) {
      return this.edges.filter(edge => edge.source === source);
    } else {
      return this.edges.filter(edge => edge.source === source || edge.target === source);
    }
  }

  findLinkedNodeIds(source: number, isDirected: boolean = this.isDirected): number[] {
    const edges = this.findLinkedEdges(source, isDirected);
    return edges.map(edge => (edge.source === source ? edge.target : edge.source));
  }

  findLinkedNodes(source: number, isDirected: boolean = this.isDirected): (Node | undefined)[] {
    const ids = this.findLinkedNodeIds(source, isDirected);
    return ids.map(id => this.findNode(id));
  }

  getRect() {
    const { baseWidth, baseHeight, padding } = this.dimensions;
    const left = -baseWidth / 2 + padding;
    const top = -baseHeight / 2 + padding;
    const right = baseWidth / 2 - padding;
    const bottom = baseHeight / 2 - padding;
    const width = right - left;
    const height = bottom - top;
    return { left, top, right, bottom, width, height };
  }

  layout() {
    const { method, args } = this.callLayout;
    method.apply(this, args);
  }

  layoutCircle(...args: unknown[]) {
    this.callLayout = { method: this.layoutCircle, args };
    const rect = this.getRect();
    const unitAngle = (2 * Math.PI) / this.nodes.length;
    let angle = -Math.PI / 2;
    for (const node of this.nodes) {
      const x = (Math.cos(angle) * rect.width) / 2;
      const y = (Math.sin(angle) * rect.height) / 2;
      node.x = x;
      node.y = y;
      angle += unitAngle;
    }
  }

  layoutTree(root: number = 0, sorted: boolean = false) {
    this.callLayout = { method: this.layoutTree, args: [root, sorted] };
    const rect = this.getRect();

    if (this.nodes.length === 1) {
      const [node] = this.nodes;
      node.x = (rect.left + rect.right) / 2;
      node.y = (rect.top + rect.bottom) / 2;
      return;
    }

    let maxDepth = 0;
    const leafCounts: Record<number, number> = {};
    let marked: Record<number, boolean> = {};
    const recursiveAnalyze = (id: number, depth: number): number => {
      marked[id] = true;
      leafCounts[id] = 0;
      if (maxDepth < depth) maxDepth = depth;
      const linkedNodeIds = this.findLinkedNodeIds(id, false);
      for (const linkedNodeId of linkedNodeIds) {
        if (marked[linkedNodeId]) continue;
        leafCounts[id] += recursiveAnalyze(linkedNodeId, depth + 1);
      }
      if (leafCounts[id] === 0) leafCounts[id] = 1;
      return leafCounts[id];
    };
    recursiveAnalyze(root, 0);

    const hGap = rect.width / leafCounts[root];
    const vGap = rect.height / maxDepth;
    marked = {};
    const recursivePosition = (node: Node, h: number, v: number) => {
      marked[node.id] = true;
      node.x = rect.left + (h + leafCounts[node.id] / 2) * hGap;
      node.y = rect.top + v * vGap;
      const linkedNodes = this.findLinkedNodes(node.id, false).filter(
        (n): n is Node => n !== undefined
      );
      if (sorted) linkedNodes.sort((a, b) => a.id - b.id);
      for (const linkedNode of linkedNodes) {
        if (marked[linkedNode.id]) continue;
        recursivePosition(linkedNode, h, v + 1);
        h += leafCounts[linkedNode.id];
      }
    };
    const rootNode = this.findNode(root);
    if (rootNode) recursivePosition(rootNode, 0, 0);
  }

  layoutRandom(...args: unknown[]) {
    this.callLayout = { method: this.layoutRandom, args };
    const rect = this.getRect();
    const placedNodes: Node[] = [];
    for (const node of this.nodes) {
      do {
        node.x = rect.left + Math.random() * rect.width;
        node.y = rect.top + Math.random() * rect.height;
      } while (placedNodes.find(placedNode => distance(node, placedNode) < 48));
      placedNodes.push(node);
    }
  }

  visit(target: number, source?: number, weight?: number) {
    this.visitOrLeave(true, target, source, weight);
  }

  leave(target: number, source?: number, weight?: number) {
    this.visitOrLeave(false, target, source, weight);
  }

  visitOrLeave(visit: boolean, target: number, source: number | null = null, weight?: number) {
    const edge = this.findEdge(source!, target);
    if (edge) edge.visitedCount += visit ? 1 : -1;
    const node = this.findNode(target);
    if (node) {
      if (weight !== undefined) node.weight = weight;
      node.visitedCount += visit ? 1 : -1;
    }
    if (this.logTracer) {
      this.logTracer.println(
        visit ? (source || '') + ' -> ' + target : (source || '') + ' <- ' + target
      );
    }
  }

  select(target: number, source?: number) {
    this.selectOrDeselect(true, target, source);
  }

  deselect(target: number, source?: number) {
    this.selectOrDeselect(false, target, source);
  }

  selectOrDeselect(select: boolean, target: number, source: number | null = null) {
    const edge = this.findEdge(source!, target);
    if (edge) edge.selectedCount += select ? 1 : -1;
    const node = this.findNode(target);
    if (node) node.selectedCount += select ? 1 : -1;
    if (this.logTracer) {
      this.logTracer.println(
        select ? (source || '') + ' => ' + target : (source || '') + ' <= ' + target
      );
    }
  }

  log(key: string) {
    this.logTracer = key ? this.getObject(key) : null;
  }
}

export default GraphTracer;
