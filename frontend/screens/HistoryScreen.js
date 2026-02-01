import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchHistory = async () => {
        if (!user?._id) return;
        try {
            const response = await axiosClient.get(`/history/${user._id}`);
            setTransactions(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // Use EN locale for consistency or TH if preferred (but API returns ISO)
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={item.status === 'borrowed' ? 'book-outline' : 'checkmark-circle-outline'}
                    size={24}
                    color={item.status === 'borrowed' ? '#FF9500' : '#34C759'}
                />
            </View>
            <View style={styles.info}>
                <Text style={styles.bookTitle}>{item.book_id?.title || 'Unknown Book'}</Text>
                <Text style={styles.date}>Borrowed: {formatDate(item.createdAt)}</Text>
                {item.status === 'returned' && (
                    <Text style={styles.returnDate}>Returned: {formatDate(item.return_date)}</Text>
                )}
            </View>
            <View style={[styles.statusBadge, item.status === 'borrowed' ? styles.statusBorrowed : styles.statusReturned]}>
                <Text style={[styles.statusText, item.status === 'borrowed' ? styles.textBorrowed : styles.textReturned]}>
                    {item.status === 'borrowed' ? 'Borrowed' : 'Returned'}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>History</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No transaction history.</Text>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#888',
    },
    returnDate: {
        fontSize: 12,
        color: '#34C759',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusBorrowed: {
        backgroundColor: '#FFF4E5',
    },
    statusReturned: {
        backgroundColor: '#E8F5E9',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    textBorrowed: {
        color: '#FF9500',
    },
    textReturned: {
        color: '#34C759',
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

export default HistoryScreen;
