import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import axiosClient from '../api/axiosClient';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AdminBorrowedScreen = () => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBorrowedBooks = async () => {
        try {
            const response = await axiosClient.get('/admin/borrowed-books');
            setBorrowedBooks(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBorrowedBooks();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBorrowedBooks();
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.bookInfo}>
                    <Text style={styles.label}>Book</Text>
                    <Text style={styles.title}>{item.book_id?.title || 'Unknown'}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.label}>Borrowed By</Text>
                    <Text style={styles.user}>{item.user_id?.username || 'Unknown'}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.dateRow}>
                <Ionicons name="time-outline" size={16} color="#FF9500" />
                <Text style={styles.date}> Due: {new Date(item.due_date).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Borrowed Books</Text>
                <Text style={styles.subtext}>Currently active loans</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={borrowedBooks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No books are currently borrowed.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5ea',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    subtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    bookInfo: {
        flex: 1,
        marginRight: 8,
    },
    userInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 10,
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    user: {
        fontSize: 16,
        fontWeight: '500',
        color: '#007AFF',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});

export default AdminBorrowedScreen;
