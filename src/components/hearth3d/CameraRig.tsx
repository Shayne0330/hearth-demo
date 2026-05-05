import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { MathUtils, OrthographicCamera, Vector3 } from 'three';
import type { Project } from '../../data/projects';
import type { HearthViewState } from './Hearth3D';
import { createBuildingLayout, findRoomLayout } from './layout';
import { SCENE } from './spaceTokens';

type CameraRigProps = {
  projects: Project[];
  viewState: HearthViewState;
};

function vectorFromTuple(tuple: readonly [number, number, number]) {
  return new Vector3(tuple[0], tuple[1], tuple[2]);
}

export function CameraRig({ projects, viewState }: CameraRigProps) {
  const { camera } = useThree();
  const layout = useMemo(() => createBuildingLayout(projects), [projects]);
  const targetLookAt = useMemo(() => new Vector3(0, 1.55, 0), []);

  useFrame((_, delta) => {
    const ortho = camera as OrthographicCamera;
    const selectedProjectId =
      viewState.type === 'focusing' || viewState.type === 'selected'
        ? viewState.projectId
        : undefined;
    const selectedRoom = findRoomLayout(layout, selectedProjectId);
    const open =
      viewState.type === 'expanding' ||
      viewState.type === 'expanded' ||
      viewState.type === 'focusing' ||
      viewState.type === 'selected';

    const basePosition =
      viewState.type === 'focusing' || viewState.type === 'selected'
        ? vectorFromTuple(SCENE.selectedCamera)
        : open
          ? vectorFromTuple(SCENE.expandedCamera)
          : vectorFromTuple(SCENE.collapsedCamera);
    const targetPosition = selectedRoom
      ? basePosition.add(new Vector3(selectedRoom.x * 0.22, selectedRoom.y * 0.08, 0))
      : basePosition;
    const targetZoom =
      viewState.type === 'focusing' || viewState.type === 'selected'
        ? SCENE.selectedZoom
        : open
          ? SCENE.expandedZoom
          : SCENE.collapsedZoom;

    camera.position.x = MathUtils.damp(camera.position.x, targetPosition.x, 5, delta);
    camera.position.y = MathUtils.damp(camera.position.y, targetPosition.y, 5, delta);
    camera.position.z = MathUtils.damp(camera.position.z, targetPosition.z, 5, delta);
    if ('zoom' in ortho) {
      ortho.zoom = MathUtils.damp(ortho.zoom, targetZoom, 5, delta);
      ortho.updateProjectionMatrix();
    }

    if (selectedRoom) {
      targetLookAt.set(selectedRoom.x * 0.2, selectedRoom.y + 0.2, selectedRoom.z);
    } else {
      targetLookAt.set(0, 1.55, 0);
    }
    camera.lookAt(targetLookAt);
  });

  return null;
}
