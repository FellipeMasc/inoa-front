import Axios from "axios";
import { useQuery, useMutation, useQueryClient, UseQueryOptions, QueryKey } from '@tanstack/react-query'
import { useEffect, useState } from "react";
import { ZodType, z } from "zod";

const defaults_urls: { [key: string]: string } = {
    local: 'http://localhost:3000/',
    prod: ''
}

Axios.defaults.baseURL = defaults_urls['local']

export const logout = (setAuthenticated: Function, navigate?: Function) => {
    setAuthenticated(false);
    navigate && navigate('/');

    localStorage.removeItem('request_authorization');
    localStorage.removeItem("user_id");

    Axios.defaults.headers.common = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: ""
    };
}
const get = (url: string, params = {}) => {
    return async () => Axios.get(url, { params: params }).then(res => res.data)
}

const hour = 60 * 60 * 1000
function useGet<T = any>(url: string, params = {}, additional_params?: UseQueryOptions<T, unknown, T, QueryKey>) {
    let queryKey = [url]
    queryKey.push(JSON.stringify(params))
    return {
        ...useQuery<T>(queryKey, get(url, params), {
            cacheTime: 7 * 24 * hour,
            staleTime: 7 * 24 * hour,
            refetchInterval: 24 * hour,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            retry: false,
            useErrorBoundary: (e: any) => e.response?.status >= 500,
            ...additional_params ?? {}
        }),
        queryKey
    };
}

function getSchema<T extends ZodType>(url: string, params = {}, schema?: T) {
    return async () => Axios.get(url, { params: params }).then(res => res.data).then(data => schema?.parse(data) ?? data)
}

export function useGetSchema<T extends ZodType>(
    url: string, schema?: T, params = {},
    additional_params?: UseQueryOptions<z.infer<T>, unknown, z.infer<T>, QueryKey>,
) {
    let queryKey = [url]
    queryKey.push(JSON.stringify(params))
    return {
        ...useQuery<z.infer<T>>(queryKey, getSchema(url, params, schema), {
            cacheTime: 7 * 24 * hour,
            staleTime: 7 * 24 * hour,
            refetchInterval: 24 * hour,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            retry: false,
            useErrorBoundary: (e: any) => e.response?.status >= 500 || (e instanceof z.ZodError),
            ...additional_params ?? {}
        }),
        queryKey
    };
}

function post<T>(url: string) {
    return async (params: T) => Axios.post(url, params).then(res => res.data).catch(error => {
        // error.response?.status >= 500 && Bugsnag.notify(error, e => {
        //     e.addMetadata('request', { params, error });
        // })
        throw error;
    });
}

function postFull<T>(url: string) {
    return async (params: T) => Axios.post(url, params, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res=>{console.log(res)
    return res}).catch(error => {
        // error.response?.status >= 500 && Bugsnag.notify(error, e => {
        //     e.addMetadata('request', { params, error })
        // })
        throw error;
    });
}

function usePost<T = any>(url: string, additional_params = {}, headers = false) {
    return useMutation([url], (headers ? postFull<T>(url) : post<T>(url)), {
        retry: false,
        ...additional_params
    });
}

// PATCH
function patch<T>(url: string) {
    return async (params: Partial<T>) => Axios.patch(url, params).then(res => res.data)
}

function patchFull<T>(url: string) {
    return async (params: Partial<T>) => Axios.patch(url, params)
}

function usePatch<T = any>(url: string, additional_params = {}, headers = false) {
    return useMutation([url], (headers ? patchFull<T>(url) : patch<T>(url)), {
        retry: false,
        ...additional_params
    });
}

// PUT
function put<T>(url: string) {
    return async (params: Partial<T>) => Axios.put(url, params).then(res => res.data)
}

function putFull<T>(url: string) {
    return async (params: Partial<T>) => Axios.patch(url, params)
}

export function usePut<T = any>(url: string, additional_params = {}, headers = false) {
    return useMutation([url], (headers ? putFull<T>(url) : put<T>(url)), {
        retry: false,
        ...additional_params
    });
}

const _delete = (url: string) => {
    return async (params: any) => Axios.delete(url, params).then(res => res.data)
}

const useDelete = (url: string, additional_params = {}) => {
    return useMutation([url], _delete(url), {
        ...additional_params
    });
}

const useClient = () => {
    return useQueryClient();
}

const prefetchQuery = async (url: string, client: any) => {
    await client.prefetchQuery([url, '{}'], get(url), {
        cacheTime: 7 * 24 * 60 * 60 * 1000,
        staleTime: 7 * 24 * 60 * 60 * 1000,
        retry: 1
    });
}

export function useDummyRequest() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 2000);
    }, [])

    return isLoading
}

export { useGet, usePost, useClient, get, prefetchQuery, useDelete, usePatch };