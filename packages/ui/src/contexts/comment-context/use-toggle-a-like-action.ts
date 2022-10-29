import {
  useDeleteLikeByPkMutation,
  useInsertOneLikeMutation,
} from '@chirpy-dev/graphql';

import { useToast } from '../../components/toast';
import { useCurrentUser } from '../../contexts/current-user-context';
import { useSignInWindow } from '../../hooks/use-sign-in-window';
import { logger } from '../../utilities/logger';

export type UseToggleALikeAction = ReturnType<typeof useToggleALikeAction>;

export function useToggleALikeAction() {
  const {
    data: { id: currentUserId },
  } = useCurrentUser();
  const [{}, insertOneLike] = useInsertOneLikeMutation();
  const [{}, deleteLikeByPk] = useDeleteLikeByPkMutation();

  const { showToast } = useToast();
  const handleSignIn = useSignInWindow();

  const toggleALikeAction = async (
    isLiked: boolean,
    likeId: string,
    commentId: string,
  ) => {
    if (!currentUserId) {
      handleSignIn();
      return;
    }
    if (isLiked) {
      const { data } = await deleteLikeByPk({
        id: likeId,
      });
      if (!data?.deleteLikeByPk?.id) {
        logger.error(`Can't delete the like, id ${likeId}`);
      }
    } else {
      try {
        const { data } = await insertOneLike({
          commentId,
        });
        if (!data?.insertOneLike?.id) {
          showToast({
            type: 'error',
            title: `Server didn't respond, please try again later.`,
          });
          logger.error(`Can't create a like action`);
        }
      } catch (error) {
        showToast({
          type: 'error',
          title: `Server didn't respond, please try again later.`,
        });
        // There is a `Unique constraint failed on the fields: (`userId`,`commentId`)` error
        // when a user click the like button again during this API processing
        // TODO: Refresh UI immediately, call APIs in the background
        logger.error('Insert a like', error);
      }
    }
  };

  return toggleALikeAction;
}
