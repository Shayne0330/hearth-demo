import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, OrthographicCamera, Vector3 } from 'three';
import type { HearthViewState } from './Hearth3D';
import { SCENE } from './spaceTokens';

type CameraRigProps = {
  viewState: HearthViewState;
};

function vectorFromTuple(tuple: readonly [number, number, number]) {
  return new Vector3(tuple[0], tuple[1], tuple[2]);
}

export function CameraRig({ viewState }: CameraRigProps) {
  const { camera } = useThree();
  const targetLookAt = new Vector3(0, 1.55, 0);

  useFrame((_, delta) => {
    const ortho = camera as OrthographicCamera;
    const open =
      viewState.type === 'expanding' ||
      viewState.type === 'expanded' ||
      viewState.type === 'focusing' ||
      viewState.type === 'selected';

    const targetPosition = open
      ? vectorFromTuple(SCENE.expandedCamera)
      : vectorFromTuple(SCENE.collapsedCamera);
    const targetZoom = open ? SCENE.expandedZoom : SCENE.collapsedZoom;

    camera.position.x = MathUtils.damp(camera.position.x, targetPosition.x, 5, delta);
    camera.position.y = MathUtils.damp(camera.position.y, targetPosition.y, 5, delta);
    camera.position.z = MathUtils.damp(camera.position.z, targetPosition.z, 5, delta);
    if ('zoom' in ortho) {
      ortho.zoom = MathUtils.damp(ortho.zoom, targetZoom, 5, delta);
      ortho.updateProjectionMatrix();
    }

    camera.lookAt(targetLookAt);
  });

  return null;
}
