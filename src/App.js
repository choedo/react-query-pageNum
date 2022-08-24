import React from 'react';
import axios from 'axios';
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";


const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

async function fetchProjects(page = 0) {
  const { data } = await axios.get('/api/projects?page=' + page);
  return data;
}

function Example() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(0);

  const { status, data, error, isFetching, isPreviousData } = useQuery(
    ['projects', page],
    () => fetchProjects(page),
    { keepPreviousData: true, staleTime: 5000 },
  );

  React.useEffect(() => {
    if(data?.hasMore) {
      queryClient.prefetchQuery(['projects', page + 1], () => 
        fetchProjects(page + 1),
      )
    }
  }, [data, page, queryClient]);

  return (
    <div>
      <p>
        페이지 예제입니다.
      </p>
      {status === 'loading' ? (
        <div>Loading...</div>
      ) : status === 'error' ? (
        <div>Error: {error.message}</div>
      ) : (
        // 'data'는 최신 페이지의 데이터로 확인되거나 새 페이지를 가져오는 경우 마지막으로 성공한 페이지의 데이터입니다.
        <div>
          {data.projects.map((project) => (
            <p key={project.id}>{project.name}</p>
          ))}
        </div>
      )}
      <div>현재 페이지: {page + 1}</div>
      <button
        onClick={() => setPage((old) => Math.max(old - 1, 0))}
        disabled={page === 0}
      >
        이전 페이지
      </button>{' '}
      <button
        onClick={() => {
          setPage((old) => (data?.hasMore ? old + 1 : old))
        }}
        disabled={isPreviousData || !data?.hasMore}
      >
        다음 페이지
      </button>
      {
        // 페이지 요청 사이에 마지막 페이지의 데이터가 남아 있을 수 있으므로 
        // "status === "loading" 상태가 트리거되지 않으므로 
        // "isFetching"을 사용하여 백그라운드 로드 표시기를 표시할 수 있습니다.
        isFetching ? <span> Loading...</span> : null
      }{' '}
      <ReactQueryDevtools initialIsOpen />
    </div>
  );
}