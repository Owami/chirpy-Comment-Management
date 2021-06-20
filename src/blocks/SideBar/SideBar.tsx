import ChevronRight from '@geist-ui/react-icons/chevronRight';
import { useRouter } from 'next/router';
import * as React from 'react';
import tw from 'twin.macro';

import { Heading } from '$/components/Heading';
import { Link } from '$/components/Link';
import { List } from '$/components/List';

import { Directory } from '$shared/types/file';

export type SideBarProps = React.PropsWithChildren<{
  directories: Directory[];
  title?: string;
  className?: string;
}>;

export function SideBar({ directories, title, className }: SideBarProps) {
  const hasValidDirectories = directories.length > 0;
  return (
    <aside
      tw="w-full flex-shrink-0 md:(w-64 block pb-16) height[calc(100vh - 4rem)] sticky top-16 flex flex-col items-end px-4 isolate overflow-y-auto"
      className={className}
    >
      {title && hasValidDirectories && (
        <Heading as="h4" tw="font-bold px-1 pb-4">
          {title}
        </Heading>
      )}

      {hasValidDirectories && (
        <div tw="w-full overflow-y-auto">
          <Directories directories={directories} />
        </div>
      )}
    </aside>
  );
}

function Directories({ directories }: Pick<SideBarProps, 'directories'>): JSX.Element {
  return (
    <List tw="space-y-2 flex-1">
      {directories.map((dir) => (
        <List.Item key={getId(dir)} noMarker tw="flex flex-col items-stretch w-full">
          <DirectoryItem directory={dir} />
        </List.Item>
      ))}
    </List>
  );
}

function DirectoryItem({ directory: dir }: { directory: Directory }) {
  const router = useRouter();
  const [isOpened, setIsOpened] = React.useState(false);
  const listMarker = dir.route ? (
    <span css={[tw`rounded-full inline-block w-1.5 h-1.5 mr-3.5 bg-gray-500`]} />
  ) : (
    <ChevronRight
      size={18}
      css={[tw`transform transition -ml-1.5 mr-2`, isOpened && tw`rotate-90`]}
    />
  );
  return (
    <>
      {dir.route ? (
        <Link
          href={dir.route}
          css={[clickableItemStyle, router.asPath === dir.route && activeStyle]}
          variant="nav"
          noUnderline
          tw="capitalize"
        >
          {listMarker}
          <span>{dir.title}</span>
        </Link>
      ) : (
        <button
          css={[
            tw`capitalize text-gray-700 hover:(text-black) dark:text-gray-200 dark:hover:text-gray-100`,
            clickableItemStyle,
            isButtonActive(dir, router.asPath) && activeStyle,
          ]}
          type="button"
          onClick={() => setIsOpened((prev) => !prev)}
        >
          {listMarker}
          <span>{dir.title}</span>
        </button>
      )}

      {dir.children && isOpened && (
        <div tw="flex flex-row items-stretch">
          <div tw="ml-0.5 w-3.5 border-l" />
          <Directories directories={dir.children} />
        </div>
      )}
    </>
  );
}

const clickableItemStyle = tw`flex flex-row items-center justify-start px-1.5 py-1 rounded hover:bg-gray-100 transition`;
const activeStyle = tw`text-black font-bold`;

function isButtonActive(dir: Directory, pathname: string) {
  if (dir.route === pathname) {
    return true;
  }
  if (dir.children) {
    for (const child of dir.children) {
      if (isButtonActive(child, pathname)) {
        return true;
      }
    }
    return false;
  }
  return false;
}

function getId(dir: Directory) {
  return dir.title + (dir.route || '');
}