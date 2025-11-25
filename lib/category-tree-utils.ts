// lib/category-tree-utils.ts - 樹狀分類工具函數

/**
 * 計算節點深度（從根節點開始計算）
 */
export function calculateDepth(node: any, parentDepth = -1): number {
  return parentDepth + 1;
}

/**
 * 更新節點及其所有子節點的深度
 */
export async function updateNodeDepths(prisma: any, nodeId: string, parentDepth = -1) {
  const depth = parentDepth + 1;
  
  // 更新當前節點深度
  await prisma.categoryNode.update({
    where: { id: nodeId },
    data: { depth },
  });
  
  // 遞迴更新子節點
  const children = await prisma.categoryNode.findMany({
    where: { parentId: nodeId },
  });
  
  for (const child of children) {
    await updateNodeDepths(prisma, child.id, depth);
  }
}

/**
 * 取得前台可見的根節點（排除隱藏節點）
 */
export async function getVisibleRootNodes(prisma: any) {
  return await prisma.categoryNode.findMany({
    where: {
      parentId: null,
      isActive: true,
      isHidden: false,
    },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });
}

/**
 * 取得完整樹（包含隱藏節點，用於後台）
 */
export async function getFullTree(prisma: any, maxDepth = 10) {
  const rootNodes = await prisma.categoryNode.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });
  
  const loadChildren = async (node: any, currentDepth: number): Promise<any> => {
    if (currentDepth >= maxDepth) return node;
    
    const children = await prisma.categoryNode.findMany({
      where: { parentId: node.id },
      orderBy: { order: "asc" },
    });
    
    return {
      ...node,
      children: await Promise.all(
        children.map(child => loadChildren(child, currentDepth + 1))
      ),
    };
  };
  
  return await Promise.all(
    rootNodes.map(node => loadChildren(node, 0))
  );
}

/**
 * 建構節點完整路徑
 */
export async function buildNodePath(prisma: any, nodeId: string): Promise<string[]> {
  const path: string[] = [];
  let currentId: string | null = nodeId;
  
  while (currentId) {
    const node = await prisma.categoryNode.findUnique({
      where: { id: currentId },
      select: { slug: true, parentId: true },
    });
    
    if (!node) break;
    path.unshift(node.slug);
    currentId = node.parentId;
  }
  
  return path;
}

/**
 * 根據 slug 路徑查找節點
 */
export async function findNodeByPath(prisma: any, slugPath: string[]) {
  if (slugPath.length === 0) return null;
  
  let currentNode = null;
  let parentId: string | null = null;
  
  for (const slug of slugPath) {
    currentNode = await prisma.categoryNode.findFirst({
      where: { slug, parentId },
    });
    
    if (!currentNode) return null;
    parentId = currentNode.id;
  }
  
  return currentNode;
}

/**
 * 移動節點到新父節點（並更新深度）
 */
export async function moveNode(
  prisma: any,
  nodeId: string,
  newParentId: string | null
) {
  // 檢查是否會造成循環引用
  if (newParentId) {
    const isDescendant = await checkIfDescendant(prisma, newParentId, nodeId);
    if (isDescendant) {
      throw new Error("Cannot move node to its own descendant");
    }
  }
  
  // 更新父節點
  await prisma.categoryNode.update({
    where: { id: nodeId },
    data: { parentId: newParentId },
  });
  
  // 更新深度
  const newParent = newParentId
    ? await prisma.categoryNode.findUnique({ where: { id: newParentId } })
    : null;
  const newParentDepth = newParent?.depth ?? -1;
  await updateNodeDepths(prisma, nodeId, newParentDepth);
  
  // 更新路徑
  const newPath = await buildNodePath(prisma, nodeId);
  await prisma.categoryNode.update({
    where: { id: nodeId },
    data: { path: newPath },
  });
}

/**
 * 檢查 ancestorId 是否為 nodeId 的子孫節點
 */
async function checkIfDescendant(
  prisma: any,
  ancestorId: string,
  nodeId: string
): Promise<boolean> {
  let currentId: string | null = ancestorId;
  
  while (currentId) {
    if (currentId === nodeId) return true;
    
    const node = await prisma.categoryNode.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    
    if (!node) break;
    currentId = node.parentId;
  }
  
  return false;
}

/**
 * 取得節點的完整面包屑路徑
 */
export async function getBreadcrumbPath(prisma: any, nodeId: string) {
  const breadcrumbs: any[] = [];
  let currentId: string | null = nodeId;
  
  while (currentId) {
    const node = await prisma.categoryNode.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        slug: true,
        name_zh: true,
        name_en: true,
        parentId: true,
        isHidden: true,
      },
    });
    
    if (!node) break;
    
    // 只加入非隱藏的節點到面包屑
    if (!node.isHidden) {
      breadcrumbs.unshift(node);
    }
    
    currentId = node.parentId;
  }
  
  return breadcrumbs;
}
