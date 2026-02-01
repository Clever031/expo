import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ReturnScreen = () => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchBorrowedBooks = async () => {
        if (!user?._id) return;
        try {
            // Re-using history endpoint but filtering client-side for "borrowed"
            // Alternatively, could create a specific backend endpoint
            const response = await axiosClient.get(`/history/${user._id}`);
            const activeBorrowed = response.data.filter(item => item.status === 'borrowed');
            setBorrowedBooks(activeBorrowed);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch borrowed books');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBorrowedBooks();
        }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBorrowedBooks();
    };

    const handleReturn = async (transaction) => {
        // Direct execution without Alert confirmation for Web compatibility testing
        console.log('Return button clicked for:', transaction.book_id?.title);

        try {
            setLoading(true);
            await axiosClient.post('/return', {
                transaction_id: transaction._id
            });

            await fetchBorrowedBooks(); // Refresh list immediately

            if (Platform.OS === 'web') {
                window.alert('Success: Book returned successfully!');
            } else {
                Alert.alert('Success', 'Book returned successfully!');
            }
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || 'Return failed';

            if (Platform.OS === 'web') {
                window.alert('Error: ' + errorMsg);
            } else {
                Alert.alert('Error', errorMsg);
            }
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.bookInfo}>
                <Text style={styles.title}>{item.book_id?.title || 'Unknown Book'}</Text>
                <Text style={styles.author}>Due Date: {new Date(item.due_date).toLocaleDateString()}</Text>
                <View style={styles.warningContainer}>
                    <Ionicons name="time-outline" size={14} color="#FF9500" />
                    <Text style={styles.daysLeft}> Please return on time</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.returnButton}
                onPress={() => handleReturn(item)}
            >
                <Text style={styles.buttonText}>Return</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Return Books</Text>
                <Text style={styles.subtext}>Active Loans</Text>
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
                            <Ionicons name="library-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No books to return.</Text>
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
    subtext: {
        fontSize: 16,
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
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    bookInfo: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    author: {
        fontSize: 14,
        color: '#d63031',
        fontWeight: '500',
        marginBottom: 8,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    daysLeft: {
        fontSize: 12,
        color: '#FF9500',
    },
    returnButton: {
        backgroundColor: '#34C759',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
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
        marginTop: 12,
    },
});

export default ReturnScreen;
